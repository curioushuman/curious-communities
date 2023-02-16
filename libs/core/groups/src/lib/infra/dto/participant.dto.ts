import { Record, Static } from 'runtypes';
import { NotEmptyString } from '@curioushuman/common';
import { MemberDto } from './member.dto';

/**
 * Type for external Participant entity
 *
 * NOTES
 * - this is a DTO to distinguish it from an actual Participant entity
 *   i.e. it is an incomplete DTO that only includes the values we need
 * - we only include the value objects we need within the groups context
 */
export const ParticipantDto = Record({
  id: NotEmptyString,
  courseId: NotEmptyString,
  memberId: NotEmptyString,

  status: NotEmptyString,
  accountOwner: NotEmptyString,

  member: MemberDto,
});

/**
 * Type for internal group entity
 */
export type ParticipantDto = Static<typeof ParticipantDto>;
