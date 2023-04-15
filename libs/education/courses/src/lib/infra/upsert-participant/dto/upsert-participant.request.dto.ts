import { Optional, Record, Static } from 'runtypes';
import { ParticipantSourceResponseDto } from '../../dto/participant-source.response.dto';
import { CourseBaseResponseDto } from '../../dto/course.response.dto';

/**
 * Externally facing DTO for upserting single participant from source
 *
 * We're including the course, so we don't have to look it up again each time
 *
 * NOTE: currently only used to invoke state machine by same name
 */
export const UpsertParticipantRequestDto = Record({
  participantSource: ParticipantSourceResponseDto,
  course: Optional(CourseBaseResponseDto),
});

export type UpsertParticipantRequestDto = Static<
  typeof UpsertParticipantRequestDto
>;
