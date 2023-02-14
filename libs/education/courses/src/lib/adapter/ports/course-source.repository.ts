import { RepositoryFindOne, RepositoryFindMethod } from '@curioushuman/common';
import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  CourseSource,
  CourseSourceIdentifier,
  CourseSourceIdentifiers,
} from '../../domain/entities/course-source';
import { CourseSourceIdSource } from '../../domain/value-objects/course-source-id-source';

/**
 * Type for the findOne method interface within repository
 */
export type CourseSourceFindMethod = RepositoryFindMethod<
  CourseSourceIdentifiers,
  CourseSource
>;

export abstract class CourseSourceRepository
  implements RepositoryFindOne<CourseSourceIdentifiers, CourseSource>
{
  /**
   * FindBy interface
   */
  abstract findOneBy: Record<CourseSourceIdentifier, CourseSourceFindMethod>;
  abstract findOne(identifier: CourseSourceIdentifier): CourseSourceFindMethod;

  /**
   * Find a course by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByIdSource(
    id: CourseSourceIdSource
  ): TaskEither<Error, CourseSource>;
}
