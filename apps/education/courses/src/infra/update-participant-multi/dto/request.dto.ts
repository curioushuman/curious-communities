import { Optional, Record, Static } from 'runtypes';
import {
  CourseBaseResponseDto,
  MemberDto,
} from '@curioushuman/cc-courses-service';
import {
  CoAwsRequestPayload,
  EventBridgeAsLambdaDestinationEvent,
  EventbridgePutEvent,
} from '@curioushuman/common';

/**
 * The DTO our function is expecting
 */
export const UpdateParticipantMultiRequestDto = Record({
  course: Optional(CourseBaseResponseDto),
  member: Optional(MemberDto),
}).withConstraint((dto) => !!(dto.course || dto.member));

export type UpdateParticipantMultiRequestDto = Static<
  typeof UpdateParticipantMultiRequestDto
>;

/**
 * The data could be handed to us as the above DTO, OR a response payload (from another service)
 */
export type UpdateParticipantMultiCourseRequestPayload =
  CoAwsRequestPayload<CourseBaseResponseDto>;
export type UpdateParticipantMultiMemberRequestPayload =
  CoAwsRequestPayload<MemberDto>;
export type UpdateParticipantMultiRequestPayload =
  | UpdateParticipantMultiCourseRequestPayload
  | UpdateParticipantMultiMemberRequestPayload;

/**
 * Within the request, it could be a DTO or a payload
 */
export type UpdateParticipantMultiRequestDtoOrPayload =
  | UpdateParticipantMultiRequestDto
  | UpdateParticipantMultiRequestPayload;

/**
 * What the request looks like when lambda is subscribed as a destination
 */
export type UpdateParticipantMultiAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<UpdateParticipantMultiRequestDtoOrPayload>;

/**
 * What the request would look like if someone 'put's it to an eventBus
 */
export type UpdateParticipantMultiPutEvent =
  EventbridgePutEvent<UpdateParticipantMultiRequestDtoOrPayload>;

/**
 * The types of event we support (as a single type)
 */
export type UpdateParticipantMultiEvent =
  | UpdateParticipantMultiAsDestinationEvent
  | UpdateParticipantMultiPutEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event with a payload or DTO
 */
export type UpdateParticipantMultiDtoOrEvent =
  | UpdateParticipantMultiRequestDto
  | UpdateParticipantMultiEvent;

function locateDtoOrPayload(
  incomingEvent: UpdateParticipantMultiEvent
): UpdateParticipantMultiRequestDtoOrPayload {
  if ('responsePayload' in incomingEvent.detail) {
    return incomingEvent.detail.responsePayload;
  }
  return incomingEvent.detail;
}

function prepareDto(
  dtoOrPayload: UpdateParticipantMultiRequestDtoOrPayload
): UpdateParticipantMultiRequestDto {
  if (!('detail' in dtoOrPayload)) {
    return dtoOrPayload;
  }
  if ('email' in dtoOrPayload.detail) {
    return {
      member: dtoOrPayload.detail,
    };
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
  incomingEvent: UpdateParticipantMultiDtoOrEvent
): UpdateParticipantMultiRequestDto {
  if ('detail' in incomingEvent) {
    return prepareDto(locateDtoOrPayload(incomingEvent));
  }
  return incomingEvent;
}
