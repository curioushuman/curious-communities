import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  CourseBase,
  CourseIdentifier,
  CourseIdentifiers,
} from '../../domain/entities/course';
import { CourseSlug } from '../../domain/value-objects/course-slug';
import { CourseSourceIdSourceValue } from '../../domain/value-objects/course-source-id-source';
import { CourseId } from '../../domain/value-objects/course-id';
import { RepositoryFindBy, RepositoryFindMethod } from '@curioushuman/common';

/**
 * TODO:
 * - [ ] move the find and check method types to generics
 * - [ ] add functions (or flags) to find course with children
 * - [ ] queryBy are for searches not based on identifiers
 */

/**
 * Type for the findOne method interface within repository
 */
export type CourseFindMethod = RepositoryFindMethod<
  CourseIdentifiers,
  CourseBase
>;

/**
 * A repository for courses
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 */
export abstract class CourseRepository
  implements RepositoryFindBy<CourseIdentifiers, CourseBase>
{
  /**
   * FindBy interface
   */
  abstract findOneBy: Record<CourseIdentifier, CourseFindMethod>;
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
