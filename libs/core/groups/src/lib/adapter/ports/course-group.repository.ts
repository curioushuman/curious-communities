import { TaskEither } from 'fp-ts/lib/TaskEither';

import { CourseGroup } from '../../domain/entities/course-group';
import { CourseId } from '../../domain/value-objects/course-id';
import { GroupRepositoryBase } from './group.repository.base';

/**
 * Repository for the Course Group entity
 */
export abstract class CourseGroupRepository extends GroupRepositoryBase<CourseGroup> {
  /**
   * All base methods will be pick up the additional identifiers
   * e.g. findOne, findOneBy, check, checkBy
   *
   * This class just needs to implement the additional supporting methods
   * e.g. findOneByCourseId, checkByCourseId
   */

  /**
   * Find a group by course ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByCourseId(value: CourseId): TaskEither<Error, CourseGroup>;

  /**
   * Check for existence of group by course ID
   */
  abstract checkByCourseId(id: CourseId): TaskEither<Error, boolean>;
}
