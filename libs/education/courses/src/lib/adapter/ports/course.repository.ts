import { TaskEither } from 'fp-ts/lib/TaskEither';

import { Course, CourseIdentifier } from '../../domain/entities/course';
import { CourseId } from '../../domain/value-objects/course-id';
import { CourseSlug } from '../../domain/value-objects/course-slug';

/**
 * Literal list of finders for a course
 */
export type CourseFinder = 'findById' | 'findBySlug';

/**
 * Returns the correct finder for the given identifier
 *
 * Note: obviously this is a hacky way to do this, but it works.
 * If we need to move beyond this un-name restriction of identifier
 * and finder name we can at any point (by using object literal or similar).
 */
export const identifierFinder = (
  identifier: CourseIdentifier
): CourseFinder => {
  let identifierString: string = identifier as string;
  identifierString =
    identifierString.charAt(0).toUpperCase() + identifierString.slice(1);

  return `findBy${identifierString}` as CourseFinder;
};

export abstract class CourseRepository {
  /**
   * Find a course by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findById(id: CourseId): TaskEither<Error, Course>;

  /**
   * Find a course by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findBySlug(slug: CourseSlug): TaskEither<Error, Course>;

  /**
   * Check for existence of course by given ID
   */
  abstract checkById(id: CourseId): TaskEither<Error, boolean>;

  /**
   * Create/update a course
   */
  abstract checkById(id: CourseId): TaskEither<Error, boolean>;
  abstract save(course: Course): TaskEither<Error, void>;
}
