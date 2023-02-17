import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  confirmSourceId,
  SourceRepository,
  EdAppApiRepositoryProps,
  EdAppApiRepository,
  EdAppApiSaveOneProcessMethod,
  RestApiFindAllProps,
  RestApiFindAllResponse,
} from '@curioushuman/common';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';

import {
  GroupSource,
  GroupSourceForCreate,
  GroupSourceIdentifier,
} from '../../../domain/entities/group-source';
import {
  GroupSourceFindMethod,
  GroupSourceRepositoryReadWrite,
} from '../../ports/group-source.repository';
import {
  EdAppApiGroupSource,
  EdAppApiGroupSourceForCreate,
  EdAppApiGroupSourceForUpdate,
} from './entities/group-source';
import { EdAppApiGroupSourceMapper } from './group-source.mapper';
import { Source } from '../../../domain/value-objects/source';
import { GroupSourceIdSource } from '../../../domain/value-objects/group-source-id-source';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { GroupName } from '../../../domain/value-objects/group-name';
import { executeTask } from '@curioushuman/fp-ts-utils';

@Injectable()
export class EdAppApiGroupSourceRepository
  implements GroupSourceRepositoryReadWrite, SourceRepository<Source>
{
  private edAppApiRepository: EdAppApiRepository<
    GroupSource,
    EdAppApiGroupSource,
    EdAppApiGroupSourceForCreate,
    EdAppApiGroupSourceForUpdate
  >;

  /**
   * The key for this source
   */
  public readonly SOURCE = 'COMMUNITY';

  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    this.logger.setContext(EdAppApiGroupSourceRepository.name);

    // set up the repository
    const props: EdAppApiRepositoryProps = {
      sourceName: 'usergroups',
      sourceRuntype: EdAppApiGroupSource,
    };
    this.edAppApiRepository = new EdAppApiRepository(
      props,
      this.httpService,
      this.logger
    );
  }

  processFindOne =
    (source: Source) =>
    (item?: EdAppApiGroupSource, uri = 'not provided'): GroupSource => {
      // did we find anything?
      if (!item) {
        throw new RepositoryItemNotFoundError(
          `Group not found for uri: ${uri}`
        );
      }

      // is it what we expected?
      // will throw error if not
      const groupItem = EdAppApiGroupSource.check(item);

      // NOTE: if the response was invalid, an error would have been thrown
      // could this similarly be in a serialisation decorator?
      return EdAppApiGroupSourceMapper.toDomain(groupItem, source);
    };

  /**
   * ? should the confirmSourceId also be in a tryCatch or similar?
   */
  findOneByIdSource = (
    value: GroupSourceIdSource
  ): TE.TaskEither<Error, GroupSource> => {
    // NOTE: this will throw an error if the value is invalid
    const id = confirmSourceId<GroupSourceIdSource>(
      GroupSourceIdSource.check(value),
      this.SOURCE
    );
    return this.edAppApiRepository.tryFindOne(
      id,
      this.processFindOne(this.SOURCE)
    );
  };

  processFindAll =
    (source: Source) =>
    (item: EdAppApiGroupSource): GroupSource => {
      // is it what we expected?
      // will throw error if not
      const groupItem = EdAppApiGroupSource.check(item);

      // NOTE: if the response was invalid, an error would have been thrown
      // could this similarly be in a serialisation decorator?
      return EdAppApiGroupSourceMapper.toDomain(groupItem, source);
    };

  /**
   * Find all objects
   */
  findAll = (
    props?: RestApiFindAllProps
  ): TE.TaskEither<Error, RestApiFindAllResponse<GroupSource>> => {
    return this.edAppApiRepository.tryFindAll(
      this.processFindAll(this.SOURCE),
      this.edAppApiRepository.prepareFindAllProps(props)
    );
  };

  /**
   * Non-specific function to find one object from a list of all of them
   * Recursive to enable paged results returned from the repository
   */
  findOneFromAll = (
    field: keyof Pick<GroupSource, 'name'>,
    value: GroupName,
    page = 1
  ): TE.TaskEither<Error, GroupSource> => {
    return TE.tryCatch(
      async () => {
        const result = await executeTask(this.findAll({ page, limit: 3 }));
        const item = result.items.find((i) => i[field] === value);
        if (item) {
          return item;
        }
        if (result.next === false) {
          throw new RepositoryItemNotFoundError(
            `Group not found for ${field}: ${value}`
          );
        }
        return await executeTask(this.findOneFromAll(field, value, page + 1));
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  findOneByName = (value: GroupName): TE.TaskEither<Error, GroupSource> => {
    const name = GroupName.check(value);
    return this.findOneFromAll('name', name);
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<GroupSourceIdentifier, GroupSourceFindMethod> = {
    idSource: this.findOneByIdSource,
    name: this.findOneByName,
  };

  findOne = (identifier: GroupSourceIdentifier): GroupSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  /**
   * This function is handed to the repository to process the response
   */
  processSaveOne =
    (
      source: Source
    ): EdAppApiSaveOneProcessMethod<GroupSource, EdAppApiGroupSource> =>
    (item) => {
      return EdAppApiGroupSourceMapper.toDomain(item, source);
    };

  /**
   * Create a record
   */
  create = (
    groupSource: GroupSourceForCreate
  ): TE.TaskEither<Error, GroupSource> => {
    // NOTE: this will throw an error if the value is invalid
    const entity = EdAppApiGroupSourceMapper.toSourceForCreate(groupSource);
    return this.edAppApiRepository.tryCreateOne(
      entity,
      this.processSaveOne(this.SOURCE)
    );
  };

  /**
   * Update a record
   */
  update = (groupSource: GroupSource): TE.TaskEither<Error, GroupSource> => {
    const entity = EdAppApiGroupSourceMapper.toSourceForUpdate(groupSource);
    return this.edAppApiRepository.tryUpdateOne(
      groupSource.id,
      entity,
      this.processSaveOne(this.SOURCE)
    );
  };

  /**
   * Delete a record
   */
  delete = (id: GroupSourceId): TE.TaskEither<Error, void> => {
    return this.edAppApiRepository.tryDeleteOne(id);
  };
}
