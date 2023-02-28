import { Optional, Record, Static, String } from 'runtypes';
import {
  EventbridgePutEvent,
  SfnTaskResponsePayload,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';
import { ParticipantSourceResponseDto } from '@curioushuman/cc-courses-service';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the FindMemberRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

/**
 * DTO that accepts any of the identifiers
 */
export const CreateMemberRequestDto = Record({
  email: Optional(String),
  memberIdSourceValue: Optional(String),
}).withConstraint((dto) => !!(dto.email || dto.memberIdSourceValue));

/**
 * DTO that accepts any of the identifiers
 */
export type CreateMemberRequestDto = Static<typeof CreateMemberRequestDto>;

/**
 * Once the step function task is complete, this is what the structure will look like
 */
interface CreateMemberAsSfnResult {
  participantSource: SfnTaskResponsePayload<ParticipantSourceResponseDto>;
}

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type CreateMemberPutEvent = EventbridgePutEvent<CreateMemberRequestDto>;

/**
 * What the input looks like when SQS is event source
 */
export type CreateMemberSqsEvent =
  SqsAsEventSourceEvent<CreateMemberRequestDto>;

/**
 * The types of event we support
 */
export type CreateMemberEvent =
  | CreateMemberAsSfnResult
  | CreateMemberPutEvent
  | CreateMemberSqsEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type CreateMemberDtoOrEvent = CreateMemberRequestDto | CreateMemberEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: CreateMemberDtoOrEvent): unknown {
  if ('participantSource' in incomingEvent) {
    return { email: incomingEvent.participantSource.detail.memberEmail };
  }
  if ('email' in incomingEvent || 'memberIdSourceValue' in incomingEvent) {
    return incomingEvent;
  }
  if ('Records' in incomingEvent) {
    return incomingEvent.Records[0].body;
  }
  // we typecast here because TS isn't able to infer due to the double optional above
  return (incomingEvent as CreateMemberPutEvent).detail;
}
