import { EventBridgeEvent } from 'aws-lambda';

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type EventbridgePutEvent<T> = EventBridgeEvent<'putEvent', T>;

/**
 * What the data looks like when eventBus used as a lambda destination
 *
 * Not ideal, but I couldn't find reference to a type to use here
 */
interface LambdaDestinationReplica<T> {
  requestContext: unknown;
  requestPayload: unknown;
  responseContext: unknown;
  responsePayload: T;
}

/**
 * What input looks like when EventBridge used as lambda destination
 * and then lambda is subscribed to the eventBus
 */
export type EventBridgeAsLambdaDestinationEvent<T> = EventBridgeEvent<
  'Lambda Function Invocation Result - Success',
  LambdaDestinationReplica<T>
>;

/**
 * What an SQS message looks like
 */
interface SqsMessage<T> {
  messageId: string;
  receiptHandle: string;
  body: T;
  attributes: unknown;
  messageAttributes: unknown;
  md5OfBody: string;
  eventSource: string;
  eventSourceARN: string;
  awsRegion: string;
}

/**
 * What the input looks like when SQS is event source
 */
export interface SqsAsEventSourceEvent<T> {
  Records: SqsMessage<T>[];
}
