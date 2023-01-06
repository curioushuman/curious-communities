import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  Course,
  CourseIdentifier,
  CourseIdentifierValue,
} from '../../domain/entities/course';
import { CourseSourceId } from '../../domain/value-objects/course-source-id';
import { CourseSlug } from '../../domain/value-objects/course-slug';
import { CourseSourceIdSourceValue } from '../../domain/value-objects/course-source-id-source';
import { CourseId } from '../../domain/value-objects/course-id';

/**
 * Type for the findOne method interface within repository
 */
export type CourseFindMethod = (
  value: CourseIdentifierValue
) => TaskEither<Error, Course>;

/**
 * Type for the check method interface within repository
 */
export type CourseCheckMethod = (
  value: CourseIdentifierValue
) => TaskEither<Error, boolean>;

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
  abstract findOneById(id: CourseSourceId): TaskEither<Error, Course>;

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
   * Object lookup for checkMethods
   */
  abstract checkBy: Record<CourseIdentifier, CourseCheckMethod>;

  /**
   * Find a course
   *
   * This method will accept a course identifier and value
   * and then determine which checker method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract check(identifier: CourseIdentifier): CourseCheckMethod;

  /**
   * Check for existence of course by given ID
   */
  abstract checkById(id: CourseId): TaskEither<Error, boolean>;

  /**
   * Check for existence of course by given ID and source value
   */
  abstract checkByIdSourceValue(
    value: CourseSourceIdSourceValue
  ): TaskEither<Error, boolean>;

  /**
   * Check for existence of course by slug
   */
  abstract checkBySlug(slug: CourseSlug): TaskEither<Error, boolean>;

  /**
   * Create/update a course
   */
  abstract save(course: Course): TaskEither<Error, Course>;
}
