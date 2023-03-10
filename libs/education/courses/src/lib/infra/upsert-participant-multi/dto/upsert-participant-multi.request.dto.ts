import { Record, Static } from 'runtypes';
import { CourseBaseResponseDto } from '../../dto/course.response.dto';

/**
 * Externally facing DTO for upserting multiple participants at a time
 *
 * Mainly when a course is first introduced into the system, we upsert
 * all the participants at once.
 */
export const UpsertParticipantMultiRequestDto = Record({
  course: CourseBaseResponseDto,
});

export type UpsertParticipantMultiRequestDto = Static<
  typeof UpsertParticipantMultiRequestDto
>;
