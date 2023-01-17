import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  CourseSource,
  CourseSourceIdentifier,
  CourseSourceIdentifierValue,
} from '../../domain/entities/course-source';
import { CourseSourceId } from '../../domain/value-objects/course-source-id';

/**
 * Type for the findOne method interface within repository
 */
export type CourseSourceFindMethod = (
  value: CourseSourceIdentifierValue
) => TaskEither<Error, CourseSource>;

export abstract class CourseSourceRepository {
  /**
   * Object lookup for findMethods
   */
  abstract findOneBy: Record<CourseSourceIdentifier, CourseSourceFindMethod>;

  /**
   * Find a course
   *
   * This method will accept a course identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOne(identifier: CourseSourceIdentifier): CourseSourceFindMethod;

  /**
   * Find a course by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneById(id: CourseSourceId): TaskEither<Error, CourseSource>;
}
