import { Record, Static } from 'runtypes';
import { ParticipantDto } from '@curioushuman/cc-groups-service';
import {
  CoAwsRequestPayload,
  EventBridgeAsLambdaDestinationEvent,
  EventbridgePutEvent,
  isResponsePayload,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';

/**
 * I am going to import the course DTO here
 * NOTE: from groups service, so we only include what is req'd by groups
 */

export const UpsertCourseGroupMemberRequestDto = Record({
  participant: ParticipantDto,
});

export type UpsertCourseGroupMemberRequestDto = Static<
  typeof UpsertCourseGroupMemberRequestDto
>;

/**
 * The data could be handed to us as the above DTO, OR a response payload
 */
export type UpsertCourseGroupMemberRequestPayload =
  CoAwsRequestPayload<ParticipantDto>;

/**
 * A type to manage the two types of input we support
 */
export type UpsertCourseGroupMemberRequestDtoOrPayload =
  | UpsertCourseGroupMemberRequestDto
  | UpsertCourseGroupMemberRequestPayload;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpsertCourseGroupMemberPutEvent =
  EventbridgePutEvent<UpsertCourseGroupMemberRequestDtoOrPayload>;

/**
 * A lambda destination wrapped in an event
 */
export type UpsertCourseGroupMemberAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<UpsertCourseGroupMemberRequestDtoOrPayload>;

/**
 * What the input looks like when SQS is event source
 */
export type UpsertCourseGroupMemberSqsEvent =
  SqsAsEventSourceEvent<UpsertCourseGroupMemberRequestDtoOrPayload>;

/**
 * The types of event we support
 */
export type UpsertCourseGroupMemberEvent =
  | UpsertCourseGroupMemberAsDestinationEvent
  | UpsertCourseGroupMemberPutEvent
  | UpsertCourseGroupMemberSqsEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpsertCourseGroupMemberDtoOrEvent =
  | UpsertCourseGroupMemberRequestDtoOrPayload
  | UpsertCourseGroupMemberEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpsertCourseGroupMemberDtoOrEvent
): unknown {
  if (
    'participant' in incomingEvent ||
    isResponsePayload<ParticipantDto>(incomingEvent)
  ) {
    return prepareDtoFromPayload(incomingEvent);
  }
  if ('Records' in incomingEvent) {
    return prepareDtoFromPayload(incomingEvent.Records[0].body);
  }
  if ('responsePayload' in incomingEvent.detail) {
    return prepareDtoFromPayload(incomingEvent.detail.responsePayload);
  }
  return prepareDtoFromPayload(incomingEvent.detail);
}

export function prepareDtoFromPayload(
  incomingEvent: UpsertCourseGroupMemberRequestDtoOrPayload
): UpsertCourseGroupMemberRequestDto {
  if (isResponsePayload<ParticipantDto>(incomingEvent)) {
    return {
      participant: incomingEvent.detail,
    };
  }
  return incomingEvent;
}
