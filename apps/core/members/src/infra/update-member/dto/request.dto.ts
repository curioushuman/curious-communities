import { Optional, Record, Static, String } from 'runtypes';
import {
  CoAwsRequestPayload,
  EventbridgePutEvent,
  prepareExternalIdSourceValue,
  SfnTaskResponsePayload,
} from '@curioushuman/common';
import {
  MemberResponseDto,
  MemberSourceResponseDto,
} from '@curioushuman/cc-members-service';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the UpdateMemberRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const UpdateMemberRequestDto = Record({
  memberIdSourceValue: Optional(String),
  member: Optional(MemberResponseDto),
}).withConstraint((dto) => !!(dto.memberIdSourceValue || dto.member));

export type UpdateMemberRequestDto = Static<typeof UpdateMemberRequestDto>;

/**
 * During the step functions task, we will be calling the
 * upsertMemberSource lambda. This is the response we expect.
 * We get our response from the task wrapped in it's own response payload
 * which will contain our response payload
 * which will contain the DTO
 */
type UpsertMemberSourceSfnTaskResponsePayload = SfnTaskResponsePayload<
  CoAwsRequestPayload<MemberSourceResponseDto>
>;

/**
 * Once the step function task is complete, this is what the structure will look like
 */
interface UpdateMemberAsSfnResult {
  member: MemberResponseDto;
  sources: {
    AUTH: UpsertMemberSourceSfnTaskResponsePayload;
    COMMUNITY: UpsertMemberSourceSfnTaskResponsePayload;
    'MICRO-COURSE': UpsertMemberSourceSfnTaskResponsePayload;
  };
}

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpdateMemberPutEvent = EventbridgePutEvent<UpdateMemberRequestDto>;

/**
 * The types of event we support
 */
export type UpdateMemberEvent = UpdateMemberPutEvent | UpdateMemberAsSfnResult;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpdateMemberDtoOrEvent = UpdateMemberRequestDto | UpdateMemberEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: UpdateMemberDtoOrEvent): unknown {
  if ('sources' in incomingEvent) {
    const idSources = [
      prepareExternalIdSourceValue(
        incomingEvent.sources.AUTH.detail.detail.id,
        'AUTH'
      ),
      prepareExternalIdSourceValue(
        incomingEvent.sources.COMMUNITY.detail.detail.id,
        'COMMUNITY'
      ),
      prepareExternalIdSourceValue(
        incomingEvent.sources['MICRO-COURSE'].detail.detail.id,
        'MICRO-COURSE'
      ),
    ];
    const member = {
      ...incomingEvent.member,
      idSources,
    };
    return { member };
  }
  if ('detail' in incomingEvent) {
    return incomingEvent.detail;
  }
  return incomingEvent;
}
