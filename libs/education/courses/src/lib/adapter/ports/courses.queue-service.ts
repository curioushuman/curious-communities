import { TaskEither } from 'fp-ts/lib/TaskEither';
import { UpdateCourseRequestDto } from '../../infra/update-course/dto/update-course.request.dto';
import { UpdateParticipantRequestDto } from '../../infra/update-participant/dto/update-participant.request.dto';
import { UpsertParticipantRequestDto } from '../../infra/upsert-participant/dto/upsert-participant.request.dto';

/**
 * This allows us to define a type for the acceptable message formats
 */
export type CoursesMessage =
  | UpdateCourseRequestDto
  | UpdateParticipantRequestDto
  | UpsertParticipantRequestDto;

/**
 * A repository for member source queue
 */
export abstract class CoursesQueueService {
  /**
   * Update courses
   */
  abstract updateCourses(
    messages: UpdateCourseRequestDto[]
  ): TaskEither<Error, void>;

  /**
   * Update participants
   */
  abstract updateParticipants(
    messages: UpdateParticipantRequestDto[]
  ): TaskEither<Error, void>;

  /**
   * Upsert participants
   */
  abstract upsertParticipants(
    messages: UpsertParticipantRequestDto[]
  ): TaskEither<Error, void>;
}
