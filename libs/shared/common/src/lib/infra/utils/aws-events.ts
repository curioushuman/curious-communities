import {
  EventBridgeAsLambdaDestinationEvent,
  SfnTaskResponsePayload,
  SqsAsEventSourceEvent,
} from '../__types__';

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
  if (incomingEvent === undefined) {
    return undefined;
  }
  const dto = locateDto(incomingEvent);

  return typeof dto === 'string' ? JSON.parse(dto) : dto;
}

export function prepareSfnTaskResponsePayload<T>(
  payload: T
): SfnTaskResponsePayload<T> {
  return { detail: payload };
}
