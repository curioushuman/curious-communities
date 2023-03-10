import { Record, Static } from 'runtypes';
import { CourseBaseResponseDto } from '@curioushuman/cc-courses-service';
import {
  CoAwsRequestPayload,
  EventBridgeAsLambdaDestinationEvent,
  EventbridgePutEvent,
} from '@curioushuman/common';

/**
 * The DTO our function is expecting
 */
export const UpsertParticipantMultiRequestDto = Record({
  course: CourseBaseResponseDto,
});

export type UpsertParticipantMultiRequestDto = Static<
  typeof UpsertParticipantMultiRequestDto
>;

/**
 * The data could be handed to us as the above DTO, OR a response payload (from another service)
 *
 * NOTE: This DTO is based on updateMulti which accepted course or member. We'll leave the
 * structure in place to handle multiple objects (just in case).
 */
export type UpsertParticipantMultiCourseRequestPayload =
  CoAwsRequestPayload<CourseBaseResponseDto>;
export type UpsertParticipantMultiRequestPayload =
  UpsertParticipantMultiCourseRequestPayload;

/**
 * Within the request, it could be a DTO or a payload
 */
export type UpsertParticipantMultiRequestDtoOrPayload =
  | UpsertParticipantMultiRequestDto
  | UpsertParticipantMultiRequestPayload;

/**
 * What the request looks like when lambda is subscribed as a destination
 */
export type UpsertParticipantMultiAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<UpsertParticipantMultiRequestDtoOrPayload>;

/**
 * What the request would look like if someone 'put's it to an eventBus
 */
export type UpsertParticipantMultiPutEvent =
  EventbridgePutEvent<UpsertParticipantMultiRequestDtoOrPayload>;

/**
 * The types of event we support (as a single type)
 */
export type UpsertParticipantMultiEvent =
  | UpsertParticipantMultiAsDestinationEvent
  | UpsertParticipantMultiPutEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event with a payload or DTO
 */
export type UpsertParticipantMultiDtoOrEvent =
  | UpsertParticipantMultiRequestDto
  | UpsertParticipantMultiEvent;

function locateDtoOrPayload(
  incomingEvent: UpsertParticipantMultiEvent
): UpsertParticipantMultiRequestDtoOrPayload {
  if ('responsePayload' in incomingEvent.detail) {
    return incomingEvent.detail.responsePayload;
  }
  return incomingEvent.detail;
}

function prepareDto(
  dtoOrPayload: UpsertParticipantMultiRequestDtoOrPayload
): UpsertParticipantMultiRequestDto {
  if (!('detail' in dtoOrPayload)) {
    return dtoOrPayload;
  }
  return {
    course: dtoOrPayload.detail,
  };
}

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpsertParticipantMultiDtoOrEvent
): UpsertParticipantMultiRequestDto {
  if ('detail' in incomingEvent) {
    return prepareDto(locateDtoOrPayload(incomingEvent));
  }
  return incomingEvent;
}
