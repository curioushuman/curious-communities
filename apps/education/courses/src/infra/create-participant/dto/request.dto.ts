import { Record, Static } from 'runtypes';
import {
  CourseBaseResponseDto,
  ParticipantSourceResponseDto,
} from '@curioushuman/cc-courses-service';
import { MemberResponseDto } from '@curioushuman/cc-members-service';
import { EventbridgePutEvent } from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * It is being called as part of a state machine, and will have quite a specific payload.
 *
 * We're going to add the event handling just in case... and for consistency
 */
export const CreateParticipantRequestDto = Record({
  participantSource: ParticipantSourceResponseDto,
  course: CourseBaseResponseDto,
  member: MemberResponseDto,
});

export type CreateParticipantRequestDto = Static<
  typeof CreateParticipantRequestDto
>;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type CreateParticipantPutEvent =
  EventbridgePutEvent<CreateParticipantRequestDto>;

/**
 * The types of event we support
 *
 * This allows us space to add additional event types
 */
export type CreateParticipantEvent = CreateParticipantPutEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type CreateParticipantDtoOrEvent =
  | CreateParticipantRequestDto
  | CreateParticipantEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: CreateParticipantDtoOrEvent): unknown {
  if ('participantSource' in incomingEvent) {
    return incomingEvent;
  }
  return incomingEvent.detail;
}
