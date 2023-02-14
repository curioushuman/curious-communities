import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import {
  DynamoDbFindOneParams,
  DynamoDbRepository,
  DynamoDbRepositoryProps,
} from '@curioushuman/common';

import { GroupFindMethod, GroupRepository } from '../../ports/group.repository';
import { GroupId } from '../../../domain/value-objects/group-id';
import {
  GroupBase,
  GroupIdentifier,
  prepareGroupExternalIdSource,
} from '../../../domain/entities/group';
import { DynamoDbGroupMapper } from './group.mapper';
import { GroupSlug } from '../../../domain/value-objects/group-slug';
import { GroupSourceIdSourceValue } from '../../../domain/value-objects/group-source-id-source';
import { DynamoDbGroup } from './entities/group';
import { GroupsItem } from './entities/item';
import { CourseId } from '../../../domain/value-objects/course-id';

/**
 * A repository for groups
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 * - we're using composition rather than inheritance here
 */
@Injectable()
export class DynamoDbGroupRepository implements GroupRepository {
  private dynamoDbRepository: DynamoDbRepository<GroupBase, GroupsItem>;

  constructor(private logger: LoggableLogger) {
    this.logger.setContext(DynamoDbGroupRepository.name);

    // set up the repository
    const props: DynamoDbRepositoryProps = {
      entityId: 'group',
      tableId: 'groups',
      globalIndexIds: [
        'slug',
        'source-id-COMMUNITY',
        'source-id-MICRO-COURSE',
        'course-id',
      ],
      prefix: 'cc',
    };
    this.dynamoDbRepository = new DynamoDbRepository(props, this.logger);
  }

  processFindOne(
    item?: Record<string, unknown>,
    params?: DynamoDbFindOneParams
  ): GroupBase {
    // did we find anything?
    if (!item) {
      throw new RepositoryItemNotFoundError(
        DynamoDbRepository.prepareErrorMessage('Group not found', params)
      );
    }

    // is it what we expected?
    // will throw error if not
    const groupItem = DynamoDbGroup.check(item);

    // NOTE: if the response was invalid, an error would have been thrown
    // could this similarly be in a serialisation decorator?
    return DynamoDbGroupMapper.toDomain(groupItem);
  }

  /**
   * NOTE: Currently does not return groupMembers
   */
  findOneById = (value: GroupId): TE.TaskEither<Error, GroupBase> => {
    // Set the parameters.
    // Group in DDB has PK = groupId and SK = groupId
    const params = this.dynamoDbRepository.prepareParamsGet({
      primaryKey: value,
      sortKey: value,
    });
    return this.dynamoDbRepository.tryGetOne(params, this.processFindOne);
  };

  findOneBySlug = (value: GroupSlug): TE.TaskEither<Error, GroupBase> => {
    // Set the parameters.
    const params = this.dynamoDbRepository.prepareParamsQueryOne({
      indexId: 'slug',
      value,
    });
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
  };

  findOneByIdSourceValue = (
    value: GroupSourceIdSourceValue
  ): TE.TaskEither<Error, GroupBase> => {
    // Set the parameters.
    const { source } = prepareGroupExternalIdSource(value);
    const params = this.dynamoDbRepository.prepareParamsQueryOne({
      indexId: `source-id-${source}`,
      value,
    });
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
  };

  findOneByCourseId = (value: CourseId): TE.TaskEither<Error, GroupBase> => {
    // Set the parameters.
    const params = this.dynamoDbRepository.prepareParamsQueryOne({
      indexId: 'courseId',
      value,
    });
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<GroupIdentifier, GroupFindMethod> = {
    id: this.findOneById,
    idSourceValue: this.findOneByIdSourceValue,
    slug: this.findOneBySlug,
    courseId: this.findOneByCourseId,
  };

  findOne = (identifier: GroupIdentifier): GroupFindMethod => {
    return this.findOneBy[identifier];
  };

  processSave(group: GroupBase): (item?: Record<string, unknown>) => GroupBase {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (_?: Record<string, unknown>) => {
      // I'm uncertain what particularly to do in here...
      // ? should we process the attributes?
      // const groupItem = DynamoDbGroup.check(item);
      // return DynamoDbGroupMapper.toDomain(groupItem);

      // currently, if there were no errors per se
      // we're just returning the group as it was
      return group;
    };
  }

  /**
   * NOTE: we do not first find the group. This responsibility
   * is delegated to the service/application layer. If a record is
   * passed to this layer, it is with full knowledge of what is
   * going to happen. i.e. save, and save alone.
   */
  save = (group: GroupBase): TE.TaskEither<Error, GroupBase> => {
    const item = DynamoDbGroupMapper.toPersistence(group);
    const params = this.dynamoDbRepository.preparePutParams(item);
    return this.dynamoDbRepository.trySave(params, this.processSave(group));
  };
}
