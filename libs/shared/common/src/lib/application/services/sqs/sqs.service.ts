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
import { executeTask, logAction } from '@curioushuman/fp-ts-utils';

import { confirmEnvVars, generateUniqueId } from '../../../utils/functions';
import {
  SqsMessageBase,
  SqsMsgOrProxyMsg,
  SqsQueueType,
  SqsSendMessageBatchProps,
  SqsTrySendMessageBatchProps,
} from './__types__';
import { AwsService } from '../aws/aws.service';
import { AwsServiceProps } from '../aws/__types__';
import { prepareSqsSfnProxy } from '../../../infra/__types__';

/**
 * A service for engaging with SQS
 */
export class SqsService<DomainMessage> extends AwsService {
  private client: SQSClient;
  awsResourceName = 'Queue';

  /**
   * Configure the service
   */
  private maxBatchSize = 5;

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

  public proxyMessage(
    props: SqsSendMessageBatchProps<DomainMessage>
  ): (body: DomainMessage) => SqsMsgOrProxyMsg<DomainMessage> {
    return (body) => {
      if (!props.queueType || props.queueType === 'standard') {
        return body;
      }
      return prepareSqsSfnProxy<DomainMessage>(
        props.id,
        this.stackId,
        this.stackPrefix
      )(body);
    };
  }

  public prepareMessage(body: SqsMsgOrProxyMsg<DomainMessage>): SqsMessageBase {
    return {
      MessageBody: JSON.stringify(body),
    };
  }

  public prepareMessages(
    props: SqsSendMessageBatchProps<DomainMessage>
  ): SqsMessageBase[] {
    return props.messages.map((message) => {
      return pipe(message, this.proxyMessage(props), this.prepareMessage);
    });
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
    result: SendMessageBatchResultEntry
  ): SendMessageBatchResultEntry {
    // DO nothing for now
    return result;
  }

  /**
   * Process the response from the SendMessageBatchCommand
   *
   * TODO:
   * - [ ] use errorFactory to throw the error
   */
  private processSendMessageBatch = (
    queueUrl: string,
    response: SendMessageBatchCommandOutput
  ): SendMessageBatchResultEntry[] => {
    // ? logging?
    // If anything do logging specific to GetCommand or AWS stats
    this.logger.debug(response);

    if (response.Failed && response.Failed.length > 0) {
      this.logger.error(response.Failed);
      throw new ServiceError(`Error sending messages: ${queueUrl}`);
    }

    if (!response.Successful) {
      throw new ServiceError(`Error sending messages: ${queueUrl}`);
    }

    return response.Successful.map(this.processMessageBatchResult);
  };

  /**
   * Actually send the batch request
   */
  private trySendMessageBatch = (
    props: SqsTrySendMessageBatchProps
  ): TE.TaskEither<Error, SendMessageBatchResultEntry[]> => {
    const { queueUrl, messages } = props;
    const queuedMessages = messages.splice(0, this.maxBatchSize);
    return TE.tryCatch(
      async () => {
        const params: SendMessageBatchCommandInput = {
          QueueUrl: queueUrl,
          Entries: queuedMessages.map((msg) =>
            this.prepareMessageBatchEntry(msg)
          ),
        };
        const response = await this.client.send(
          new SendMessageBatchCommand(params)
        );
        const results = this.processSendMessageBatch(queueUrl, response);
        if (messages.length > 0) {
          const remainingResultsTask = this.trySendMessageBatch({
            queueUrl,
            messages,
          });
          const remainingResults = await executeTask(remainingResultsTask);
          return [...results, ...remainingResults];
        }
        return results;
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  private prepareSendMessageBatch =
    (props: SqsSendMessageBatchProps<DomainMessage>) =>
    (queueUrl: string): TE.TaskEither<Error, SqsTrySendMessageBatchProps> => {
      return TE.right({
        queueUrl,
        messages: this.prepareMessages(props),
      });
    };

  /**
   * Throttled queues with destination are on the common stack
   */
  private stackIdForQueueType(queueType: SqsQueueType | undefined): string {
    if (!queueType || queueType === 'standard') {
      return this.stackId;
    }
    return queueType === 'throttled-destinations' ? 'common' : this.stackId;
  }

  /**
   * API for batch sending
   *
   * TODO:
   * - [ ] improve the queue stack id and queue id stuff
   */
  public sendMessageBatch = (
    props: SqsSendMessageBatchProps<DomainMessage>
  ): TE.TaskEither<Error, void> => {
    if (props.messages.length === 0) {
      // throw new ServiceError('Empty message list received for sending');
      // UPDATE: I don't think it deserves an error... we just don't send anything
      return TE.right(undefined);
    }
    const queueStackId = this.stackIdForQueueType(props.queueType);
    const queueId =
      props.queueType === 'throttled-destinations' ? 'throttled' : props.id;
    return pipe(
      queueId,
      this.prepareResourceName(this, queueStackId),
      this.tryGetQueueUrl,
      TE.map(this.processGetQueueUrl(props.id)),
      logAction(
        this.logger,
        this.errorFactory,
        'successfully retrieved Queue URL',
        'failed to retrieve Queue URL'
      ),
      TE.chain(this.prepareSendMessageBatch(props)),
      TE.chain(this.trySendMessageBatch),
      logAction(
        this.logger,
        this.errorFactory,
        'successfully sent messages',
        'failed to send messages'
      ),
      // we've logged the result, we don't need to pass the info any further
      TE.map(() => undefined)
    );
  };
}
