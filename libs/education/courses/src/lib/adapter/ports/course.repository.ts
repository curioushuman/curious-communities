import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  Course,
  CourseBase,
  CourseIdentifier,
  CourseIdentifierValue,
} from '../../domain/entities/course';
import { CourseSlug } from '../../domain/value-objects/course-slug';
import { CourseSourceIdSourceValue } from '../../domain/value-objects/course-source-id-source';
import { CourseId } from '../../domain/value-objects/course-id';

/**
 * TODO:
 * - [ ] move the find and check method types to generics
 */

/**
 * Type for the findOne method interface within repository
 */
export type CourseFindMethod = (
  value: CourseIdentifierValue
) => TaskEither<Error, Course>;

export abstract class CourseRepository {
  /**
   * Object lookup for findMethods
   */
  abstract findOneBy: Record<CourseIdentifier, CourseFindMethod>;

  /**
   * Find a course
   *
   * This method will accept a course identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOne(identifier: CourseIdentifier): CourseFindMethod;

  /**
   * Find a course by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneById(id: CourseId): TaskEither<Error, Course>;

  /**
   * Find a course by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByIdSourceValue(
    value: CourseSourceIdSourceValue
  ): TaskEither<Error, Course>;

  /**
   * Find a course by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneBySlug(slug: CourseSlug): TaskEither<Error, Course>;

  /**
   * Create/update a course
   *
   * NOTE: just the base, not the full course
   * * This will be the pattern for parents, just the base
   */
  abstract save(course: CourseBase): TaskEither<Error, Course>;
}
