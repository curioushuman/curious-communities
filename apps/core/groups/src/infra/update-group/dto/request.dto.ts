import { Record, Static } from 'runtypes';
import {
  GroupBaseResponseDto,
  GroupSourceResponseDto,
} from '@curioushuman/cc-groups-service';

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
 */
export const UpdateGroupRequestDto = Record({
  detail: Record({
    responsePayload: Record({
      group: GroupBaseResponseDto,
    }),
  }),
  groupSources: Record({
    COMMUNITY: GroupSourceResponseDto,
    MICROCOURSE: GroupSourceResponseDto,
  }),
});

export type UpdateGroupRequestDto = Static<typeof UpdateGroupRequestDto>;
