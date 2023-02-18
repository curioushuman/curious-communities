import { Record, Static } from 'runtypes';
import { ParticipantDto } from '@curioushuman/cc-groups-service';
import {
  EventBridgeAsLambdaDestinationEvent,
  EventbridgePutEvent,
  isLambdaDestinationEvent,
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
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpsertCourseGroupMemberPutEvent =
  EventbridgePutEvent<UpsertCourseGroupMemberRequestDto>;

/**
 * A lambda destination wrapped in an event
 */
export type UpsertCourseGroupMemberAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<ParticipantDto>;

/**
 * What the input looks like when SQS is event source
 */
export type UpsertCourseGroupMemberSqsEvent =
  SqsAsEventSourceEvent<UpsertCourseGroupMemberRequestDto>;

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
  | UpsertCourseGroupMemberRequestDto
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
  if ('participant' in incomingEvent) {
    return incomingEvent;
  }
  if (isLambdaDestinationEvent(incomingEvent)) {
    return incomingEvent.detail.responsePayload === null
      ? null
      : { member: incomingEvent.detail.responsePayload };
  }
  return 'Records' in incomingEvent
    ? incomingEvent.Records[0].body
    : incomingEvent.detail;
}
