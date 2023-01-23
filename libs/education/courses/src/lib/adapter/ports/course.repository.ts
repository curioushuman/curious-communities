import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
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
 * - [ ] add functions (or flags) to find course with children
 * - [ ] queryBy are for searches not based on identifiers
 */

/**
 * Type for the findOne method interface within repository
 */
export type CourseFindMethod = (
  value: CourseIdentifierValue
) => TaskEither<Error, CourseBase>;

/**
 * A repository for courses
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 */
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
  abstract findOneById(id: CourseId): TaskEither<Error, CourseBase>;

  /**
   * Find a course by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByIdSourceValue(
    value: CourseSourceIdSourceValue
  ): TaskEither<Error, CourseBase>;

  /**
   * Find a course by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneBySlug(slug: CourseSlug): TaskEither<Error, CourseBase>;

  /**
   * Create/update a course
   *
   * NOTE: just the base, not the full course
   * * This will be the pattern for parents, just the base
   */
  abstract save(course: CourseBase): TaskEither<Error, CourseBase>;
}
