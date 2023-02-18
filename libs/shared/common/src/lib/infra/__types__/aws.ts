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
 * Destination event predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
export function isLambdaDestinationEvent<
  T extends EventBridgeAsLambdaDestinationEvent<T>
>(event: unknown): event is EventBridgeAsLambdaDestinationEvent<T> {
  return (
    (event as EventBridgeAsLambdaDestinationEvent<T>).detail.responsePayload !==
    undefined
  );
}

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

/**
 * SQS event source event predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
export function isSqsEventSourceEvent<T extends SqsAsEventSourceEvent<T>>(
  event: unknown
): event is SqsAsEventSourceEvent<T> {
  return (event as SqsAsEventSourceEvent<T>).Records !== undefined;
}

/**
 * This will check the data is in the correct format
 */
export function parseDto<T>(
  incomingEvent: T,
  locateDto: (incomingEvent: T) => unknown
): unknown | undefined {
  const dto =
    incomingEvent === undefined ? undefined : locateDto(incomingEvent);
  return typeof dto === 'string' ? JSON.parse(dto) : dto;
}
