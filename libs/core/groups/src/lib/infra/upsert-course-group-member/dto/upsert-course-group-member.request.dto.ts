import { Record, Static } from 'runtypes';
import { ParticipantDto } from '../../../domain/entities/participant.dto';

/**
 * DTO that accepts any of the identifiers
 */
export const UpsertCourseGroupMemberRequestDto = Record({
  participant: ParticipantDto,
});

/**
 * DTO that accepts any of the identifiers
 */
export type UpsertCourseGroupMemberRequestDto = Static<
  typeof UpsertCourseGroupMemberRequestDto
>;
