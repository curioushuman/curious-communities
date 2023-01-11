import { Record, Static } from 'runtypes';
import { ParticipantDto } from './participant.dto';

/**
 * DTO that accepts any of the identifiers
 */
export const MutateCourseGroupMemberRequestDto = Record({
  participant: ParticipantDto,
});

/**
 * DTO that accepts any of the identifiers
 */
export type MutateCourseGroupMemberRequestDto = Static<
  typeof MutateCourseGroupMemberRequestDto
>;
