import { Optional, Record, Static } from 'runtypes';
import { ParticipantFilters } from '../../../domain/entities/participant';
import { CourseId } from '../../../domain/value-objects/course-id';

/**
 * Input for query to find participants
 *
 * TODO:
 * - [ ] accept filters and such
 */
export const FindParticipantsDto = Record({
  parentId: Optional(CourseId),
  filters: Optional(ParticipantFilters),
}).withConstraint((dto) => !!(dto.parentId || dto.filters));

export type FindParticipantsDto = Static<typeof FindParticipantsDto>;
