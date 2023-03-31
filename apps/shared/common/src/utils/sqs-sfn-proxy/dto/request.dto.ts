import {
  SqsAsEventSourceEvent,
  SqsSfnProxyRequestDto,
} from '@curioushuman/common';

/**
 * Setting this DTO up to accept any DTO
 *
 * The lambda doesn't actually need to know about it, it's just passing through
 */
type SqsSfnProxyRequestDtoUnknown = SqsSfnProxyRequestDto<unknown>;

/**
 * What the input looks like when SQS is event source
 */
export type SqsSfnProxySqsEvent =
  SqsAsEventSourceEvent<SqsSfnProxyRequestDtoUnknown>;

/**
 * The types of event we support
 *
 * This allows us space to add additional event types
 */
export type SqsSfnProxyEvent = SqsSfnProxySqsEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type SqsSfnProxyDtoOrEvent =
  | SqsSfnProxyRequestDtoUnknown
  | SqsSfnProxyEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: SqsSfnProxyDtoOrEvent
): SqsSfnProxyRequestDtoUnknown {
  if ('Records' in incomingEvent) {
    return incomingEvent.Records[0].body;
  }
  return incomingEvent;
}
