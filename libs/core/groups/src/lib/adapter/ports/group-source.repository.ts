import { TaskEither } from 'fp-ts/lib/TaskEither';
import { Group } from '../../domain/entities/group';

import {
  GroupSource,
  GroupSourceForCreate,
  GroupSourceIdentifier,
  GroupSourceIdentifierValue,
} from '../../domain/entities/group-source';
import { GroupSourceId } from '../../domain/value-objects/group-source-id';
import { Source } from '../../domain/value-objects/source';

/**
 * Type for the findOne method interface within repository
 */
export type GroupSourceFindMethod = (
  value: GroupSourceIdentifierValue
) => TaskEither<Error, GroupSource>;

export abstract class GroupSourceRepository {
  /**
   * Each source repository should also be marked with the source
   * it represents
   */
  abstract readonly source: Source;

  /**
   * Object lookup for findMethods
   */
  abstract readonly findOneBy: Record<
    GroupSourceIdentifier,
    GroupSourceFindMethod
  >;

  /**
   * Find a group
   *
   * This method will accept a group identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOne(identifier: GroupSourceIdentifier): GroupSourceFindMethod;

  /**
   * Find a group by the given ID
   *
   * NOTES
   * - will throw NotFoundException if not found
   * - idSource is parsed to id in application layer
   */
  abstract findOneById(id: GroupSourceId): TaskEither<Error, GroupSource>;

  /**
   * Find a source, from the entity it reflects
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByEntity(group: Group): TaskEither<Error, GroupSource>;

  /**
   * Create/update a group
   */
  abstract create(group: GroupSourceForCreate): TaskEither<Error, GroupSource>;

  /**
   * Create/update a group
   */
  abstract update(group: GroupSource): TaskEither<Error, GroupSource>;
}

export abstract class GroupSourceCommunityRepository extends GroupSourceRepository {}
export abstract class GroupSourceMicroCourseRepository extends GroupSourceRepository {}
