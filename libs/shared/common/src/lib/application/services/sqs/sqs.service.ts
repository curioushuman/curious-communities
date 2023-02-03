import { Injectable, OnModuleDestroy } from '@nestjs/common';
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
  BasicServiceErrorFactory,
  ServiceError,
  ServiceErrorFactory,
  ServiceNotFoundError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import { dashToCamelCase, generateUniqueId } from '../../../utils/functions';
import { SqsMessageBase, SqsServiceProps } from './sqs.service.types';
import { logAction } from '@curioushuman/fp-ts-utils';

/**
 * A service for engaging with SQS
 *
 * TODO:
 * - [ ] init the queueUrl in the constructor
 *       include it as an exportable from a dynamic module with async register function
 */
@Injectable()
export class SqsService implements OnModuleDestroy {
  private client: SQSClient;
  private errorFactory: ServiceErrorFactory;

  /**
   * This stuff must mirror what's in the CDK stack and cdk-utils
   */
  private awsResourceQueue = 'Queue';

  private prefix!: string;
  private queueId!: string;
  private queueName!: string;

  private prepareName(id: string): string {
    return dashToCamelCase(id);
  }

  private preparePrefix(prefix: string | undefined): void {
    const envPrefix = process.env.AWS_NAME_PREFIX || '';
    this.prefix = this.prepareName(prefix || envPrefix);
  }

  private prepareQueue(id: string): void {
    this.queueId = id;
    const suffix = this.awsResourceQueue;
    this.queueName = `${this.prefix}${this.prepareName(id)}${suffix}`;
  }

  constructor(props: SqsServiceProps, private logger: LoggableLogger) {
    const { queueId, prefix } = props;
    // set the resources, in order
    this.preparePrefix(prefix);
    this.prepareQueue(queueId);

    // prepare the clients
    this.client = new SQSClient({ region: process.env.CDK_DEPLOY_REGION });

    // prepare the error factory
    this.errorFactory = new BasicServiceErrorFactory();
  }

  /**
   * A Nest.js lifecycle hook
   *
   * Based on the docs it looks like this hook will be called either
   * when the application is closed (app.close()) or when the application
   * receives a termination signal (SIGINT, SIGTERM, etc.)
   *
   * https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown
   *
   * TODO:
   * - [ ] is there a way to throw an error if the module does not include the
   *       correct listeners?
   */
  onModuleDestroy() {
    this.client.destroy();
  }

  /**
   * Send away for the queueUrl based on the name
   */
  private tryGetQueueUrlResponse = (): TE.TaskEither<
    Error,
    GetQueueUrlCommandOutput
  > => {
    return TE.tryCatch(
      async () => {
        const params: GetQueueUrlCommandInput = {
          QueueName: this.queueName,
        };
        return this.client.send(new GetQueueUrlCommand(params));
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Process the response from the GetQueueUrlCommand
   */
  private processGetQueueUrlResponse = (
    response: GetQueueUrlCommandOutput
  ): string => {
    // ? logging?
    // If anything do logging specific to GetCommand or AWS stats
    this.logger.debug(response);

    if (!response.QueueUrl) {
      throw new ServiceNotFoundError(`Queue URL not found: ${this.queueName}`);
    }

    return response.QueueUrl;
  };

  public prepareMessage(body: object): SqsMessageBase {
    return {
      MessageBody: JSON.stringify(body),
    };
  }

  public prepareMessages(messages: object[]): SqsMessageBase[] {
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
  private processSendMessageBatchResponse = (
    response: SendMessageBatchCommandOutput
  ): void => {
    // ? logging?
    // If anything do logging specific to GetCommand or AWS stats
    this.logger.debug(response);

    if (response.Failed && response.Failed.length > 0) {
      this.logger.error(response.Failed);
      throw new ServiceError(`Error sending messages: ${this.queueName}`);
    }

    if (!response.Successful) {
      throw new ServiceError(`Error sending messages: ${this.queueName}`);
    }

    response.Successful.forEach(this.processMessageBatchResult);
  };

  /**
   * Actually send the batch request
   */
  private trySendMessageBatch =
    (messages: SqsMessageBase[]) =>
    (queueUrl: string): TE.TaskEither<Error, SendMessageBatchCommandOutput> => {
      return TE.tryCatch(
        async () => {
          const params: SendMessageBatchCommandInput = {
            QueueUrl: queueUrl,
            Entries: messages.map((msg) => this.prepareMessageBatchEntry(msg)),
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
    messages: SqsMessageBase[]
  ): TE.TaskEither<Error, void> => {
    if (messages.length === 0) {
      throw new ServiceError('Empty message list received for sending');
    }
    return pipe(
      this.tryGetQueueUrlResponse(),
      TE.map(this.processGetQueueUrlResponse),
      logAction(
        this.logger,
        this.errorFactory,
        'successfully retrieved Queue URL',
        'failed to retrieve Queue URL'
      ),
      TE.chain(this.trySendMessageBatch(messages)),
      TE.map(this.processSendMessageBatchResponse),
      logAction(
        this.logger,
        this.errorFactory,
        'successfully sent messages',
        'failed to send messages'
      )
    );
  };
}
