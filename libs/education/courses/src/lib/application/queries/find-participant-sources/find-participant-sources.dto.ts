import { Record, Static } from 'runtypes';
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';

/**
 * Input for query to find participant sources
 *
 * TODO:
 * - [ ] accept filters and such
 * - [ ] accept paging arguments within the DTO
 */
export const FindParticipantSourcesDto = Record({
  parentId: CourseSourceId,
});

export type FindParticipantSourcesDto = Static<
  typeof FindParticipantSourcesDto
>;
