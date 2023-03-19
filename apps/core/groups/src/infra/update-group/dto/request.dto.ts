import { Record, Static } from 'runtypes';
import {
  GroupBaseResponseDto,
  GroupSourceResponseDto,
} from '@curioushuman/cc-groups-service';
import {
  CoAwsRequestPayload,
  prepareExternalIdSourceValue,
  SfnTaskResponsePayload,
} from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * It is being called as part of a state machine, and will have quite a specific payload.
 * {
 *  detail: {
 *   responsePayload: {
 *     group: {course-group that incited the step functions}
 *   }
 *  groupSources: {
 *   COMMUNITY: {groupSource for COMMUNITY},
 *   MICROCOURSE: {groupSource for MICROCOURSE},
 *  }
 * }
 *
 * Adding event handling just for consistency
 */
export const UpdateGroupRequestDto = Record({
  group: GroupBaseResponseDto,
});

export type UpdateGroupRequestDto = Static<typeof UpdateGroupRequestDto>;

/**
 * During the step functions task, we will be calling the
 * upsertGroupSource lambda. This is the response we expect.
 * We get our response from the task wrapped in it's own response payload
 * which will contain our response payload
 * which will contain the DTO
 */
type UpsertGroupSourceSfnTaskResponsePayload = SfnTaskResponsePayload<
  CoAwsRequestPayload<GroupSourceResponseDto>
>;

/**
 * Once the tasks are complete, this is what the structure will look like
 */
interface UpdateGroupAsSfnResult {
  group: GroupBaseResponseDto;
  sources: {
    COMMUNITY: UpsertGroupSourceSfnTaskResponsePayload;
    'MICRO-COURSE': UpsertGroupSourceSfnTaskResponsePayload;
  };
}

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpdateGroupDtoOrEvent =
  | UpdateGroupRequestDto
  | UpdateGroupAsSfnResult;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpdateGroupDtoOrEvent
): UpdateGroupRequestDto {
  if ('sources' in incomingEvent) {
    const sourceIds = [
      prepareExternalIdSourceValue(
        incomingEvent.sources.COMMUNITY.detail.detail.id,
        'COMMUNITY'
      ),
      prepareExternalIdSourceValue(
        incomingEvent.sources['MICRO-COURSE'].detail.detail.id,
        'MICRO-COURSE'
      ),
    ];
    const group = {
      ...incomingEvent.group,
      sourceIds,
    };
    return { group };
  }
  return incomingEvent;
}
