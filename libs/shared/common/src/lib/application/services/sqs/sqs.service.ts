import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import {
  GetQueueUrlCommand,
  GetQueueUrlCommandInput,
  GetQueueUrlCommandOutput,
  SendMessageBatchCommand,
  SendMessageBatchCommandInput,
  SendMessageBatchCommandOutput,
  SendMessageBatchRequestEntry,
  SendMessageBatchResultEntry,
  SQSClient,
} from '@aws-sdk/client-sqs';

import {
  ServiceError,
  ServiceNotFoundError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';
import { logAction } from '@curioushuman/fp-ts-utils';

import { confirmEnvVars, generateUniqueId } from '../../../utils/functions';
import { SqsMessageBase, SqsSendMessageBatchProps } from './__types__';
import { AwsService } from '../aws/aws.service';
import { AwsServiceProps } from '../aws/__types__';

/**
 * A service for engaging with SQS
 */
@Injectable()
export class SqsService<DomainMessage> extends AwsService {
  private client: SQSClient;
  awsResourceName = 'Queue';

  constructor(props: AwsServiceProps, private logger: LoggableLogger) {
    super(props);

    // prepare the client
    confirmEnvVars(['AWS_REGION']);
    this.client = new SQSClient({ region: process.env.AWS_REGION });
  }

  /**
   * A Nest.js lifecycle hook; see AwsService for more info
   */
  onModuleDestroy() {
    this.client.destroy();
  }

  /**
   * Send away for the queueUrl based on the name
   */
  private tryGetQueueUrl = (
    queueName: string
  ): TE.TaskEither<Error, GetQueueUrlCommandOutput> => {
    return TE.tryCatch(
      async () => {
        const params: GetQueueUrlCommandInput = {
          QueueName: queueName,
        };
        this.logger.debug(queueName, 'tryGetQueueUrl');
        return this.client.send(new GetQueueUrlCommand(params));
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Process the response from the GetQueueUrlCommand
   */
  private processGetQueueUrl = (
    queueId: string
  ): ((response: GetQueueUrlCommandOutput) => string) => {
    return (response) => {
      // ? logging?
      // If anything do logging specific to GetCommand or AWS stats
      this.logger.debug(response, 'processGetQueueUrl');

      if (!response.QueueUrl) {
        throw new ServiceNotFoundError(`Queue URL not found: ${queueId}`);
      }

      return response.QueueUrl;
    };
  };

  public prepareMessage(body: DomainMessage): SqsMessageBase {
    return {
      MessageBody: JSON.stringify(body),
    };
  }

  public prepareMessages(messages: DomainMessage[]): SqsMessageBase[] {
    return messages.map(this.prepareMessage);
  }

  /**
   * Prepare a message for sending
   *
   * TODO:
   * - [ ] improve / make use of the Id
   */
  private prepareMessageBatchEntry(
    messageBase: SqsMessageBase,
    id?: string
  ): SendMessageBatchRequestEntry {
    const Id = id || generateUniqueId();
    return {
      ...messageBase,
      Id,
    };
  }

  /**
   * Process message response
   *
   * TODO:
   * - [ ] check the MD5 of the message
   * ? [ ] do something with the sequence?
   * ? [ ] log the message?
   *
   * Reference:
   * - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/interfaces/sendmessagebatchresultentry.html
   */
  private processMessageBatchResult(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: SendMessageBatchResultEntry
  ): void {
    // DO nothing for now
  }

  /**
   * Process the response from the SendMessageBatchCommand
   *
   * TODO:
   * - [ ] use errorFactory to throw the error
   */
  private processSendMessageBatch = (
    queueId: string
  ): ((response: SendMessageBatchCommandOutput) => void) => {
    return (response) => {
      // ? logging?
      // If anything do logging specific to GetCommand or AWS stats
      this.logger.debug(response);

      if (response.Failed && response.Failed.length > 0) {
        this.logger.error(response.Failed);
        throw new ServiceError(`Error sending messages: ${queueId}`);
      }

      if (!response.Successful) {
        throw new ServiceError(`Error sending messages: ${queueId}`);
      }

      response.Successful.forEach(this.processMessageBatchResult);
    };
  };

  /**
   * Actually send the batch request
   */
  private trySendMessageBatch =
    (messages: DomainMessage[]) =>
    (queueUrl: string): TE.TaskEither<Error, SendMessageBatchCommandOutput> => {
      const preparedMessages = this.prepareMessages(messages);
      return TE.tryCatch(
        async () => {
          const params: SendMessageBatchCommandInput = {
            QueueUrl: queueUrl,
            Entries: preparedMessages.map((msg) =>
              this.prepareMessageBatchEntry(msg)
            ),
          };
          return this.client.send(new SendMessageBatchCommand(params));
        },
        // NOTE: we don't use an error factory here, it is one level up
        (reason: unknown) => reason as Error
      );
    };

  /**
   * API for batch sending
   */
  public sendMessageBatch = (
    props: SqsSendMessageBatchProps<DomainMessage>
  ): TE.TaskEither<Error, void> => {
    if (props.messages.length === 0) {
      // throw new ServiceError('Empty message list received for sending');
      // UPDATE: I don't think it deserves an error... just don't send anything
      return TE.right(undefined);
    }
    return pipe(
      props.id,
      this.prepareResourceName(this),
      this.tryGetQueueUrl,
      TE.map(this.processGetQueueUrl(props.id)),
      logAction(
        this.logger,
        this.errorFactory,
        'successfully retrieved Queue URL',
        'failed to retrieve Queue URL'
      ),
      TE.chain(this.trySendMessageBatch(props.messages)),
      TE.map(this.processSendMessageBatch(props.id)),
      logAction(
        this.logger,
        this.errorFactory,
        'successfully sent messages',
        'failed to send messages'
      )
    );
  };
}
