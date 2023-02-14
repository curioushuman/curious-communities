import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  confirmSourceId,
  SourceRepository,
  TribeApiRepositoryProps,
  TribeApiRepository,
  TribeApiSaveOneProcessMethod,
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
  TribeApiGroupSource,
  TribeApiGroupSourceForCreate,
  TribeApiGroupSourceForUpdate,
} from './entities/group-source';
import { TribeApiGroupSourceMapper } from './group-source.mapper';
import { Source } from '../../../domain/value-objects/source';
import { GroupSourceIdSource } from '../../../domain/value-objects/group-source-id-source';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { GroupName } from '../../../domain/value-objects/group-name';

@Injectable()
export class TribeApiGroupSourceRepository
  implements GroupSourceRepositoryReadWrite, SourceRepository<Source>
{
  private tribeApiRepository: TribeApiRepository<
    GroupSource,
    TribeApiGroupSource,
    TribeApiGroupSourceForCreate,
    TribeApiGroupSourceForUpdate
  >;

  /**
   * The key for this source
   */
  public readonly SOURCE = 'COMMUNITY';

  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    this.logger.setContext(TribeApiGroupSourceRepository.name);

    // set up the repository
    const props: TribeApiRepositoryProps = {
      sourceName: 'groups',
      sourceRuntype: TribeApiGroupSource,
    };
    this.tribeApiRepository = new TribeApiRepository(
      props,
      this.httpService,
      this.logger
    );
  }

  processFindOne =
    (source: Source) =>
    (item?: TribeApiGroupSource, uri = 'not provided'): GroupSource => {
      // did we find anything?
      if (!item) {
        throw new RepositoryItemNotFoundError(
          `Group not found for uri: ${uri}`
        );
      }

      // is it what we expected?
      // will throw error if not
      const groupItem = TribeApiGroupSource.check(item);

      // NOTE: if the response was invalid, an error would have been thrown
      // could this similarly be in a serialisation decorator?
      return TribeApiGroupSourceMapper.toDomain(groupItem, source);
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
    return this.tribeApiRepository.tryFindOne(
      id,
      this.processFindOne(this.SOURCE)
    );
  };

  findOneByName = (value: GroupName): TE.TaskEither<Error, GroupSource> => {
    const name = GroupName.check(value);
    return this.tribeApiRepository.tryQueryOne(
      name,
      this.processFindOne(this.SOURCE)
    );
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
    ): TribeApiSaveOneProcessMethod<GroupSource, TribeApiGroupSource> =>
    (item) => {
      return TribeApiGroupSourceMapper.toDomain(item, source);
    };

  /**
   * Create a record
   */
  create = (
    groupSource: GroupSourceForCreate
  ): TE.TaskEither<Error, GroupSource> => {
    // NOTE: this will throw an error if the value is invalid
    const entity = TribeApiGroupSourceMapper.toSourceForCreate(groupSource);
    return this.tribeApiRepository.tryCreateOne(
      entity,
      this.processSaveOne(this.SOURCE)
    );
  };

  /**
   * Update a record
   */
  update = (groupSource: GroupSource): TE.TaskEither<Error, GroupSource> => {
    const entity = TribeApiGroupSourceMapper.toSourceForUpdate(groupSource);
    return this.tribeApiRepository.tryUpdateOne(
      groupSource.id,
      entity,
      this.processSaveOne(this.SOURCE)
    );
  };

  /**
   * Delete a record
   */
  delete = (id: GroupSourceId): TE.TaskEither<Error, void> => {
    return this.tribeApiRepository.tryDeleteOne(id);
  };
}
