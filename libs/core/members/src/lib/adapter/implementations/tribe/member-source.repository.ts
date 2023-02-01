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

import {
  MemberSource,
  MemberSourceForCreate,
  MemberSourceIdentifier,
} from '../../../domain/entities/member-source';
import {
  MemberSourceFindMethod,
  MemberSourceRepositoryReadWrite,
} from '../../ports/member-source.repository';
import {
  TribeApiMemberSource,
  TribeApiMemberSourceForCreate,
  TribeApiMemberSourceForUpdate,
} from './entities/member-source';
import { TribeApiMemberSourceMapper } from './member-source.mapper';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import { Source } from '../../../domain/value-objects/source';
import { MemberSourceIdSource } from '../../../domain/value-objects/member-source-id-source';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';

@Injectable()
export class TribeApiMemberSourceRepository
  implements MemberSourceRepositoryReadWrite, SourceRepository<Source>
{
  private tribeApiRepository: TribeApiRepository<
    MemberSource,
    TribeApiMemberSource,
    TribeApiMemberSourceForCreate,
    TribeApiMemberSourceForUpdate
  >;

  /**
   * The key for this source
   */
  public readonly SOURCE = 'COMMUNITY';

  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    this.logger.setContext(TribeApiMemberSourceRepository.name);

    // set up the repository
    const props: TribeApiRepositoryProps = {
      sourceName: 'users',
      sourceRuntype: TribeApiMemberSource,
    };
    this.tribeApiRepository = new TribeApiRepository(
      props,
      this.httpService,
      this.logger
    );
  }

  processFindOne =
    (source: Source) =>
    (item?: TribeApiMemberSource, uri = 'not provided'): MemberSource => {
      // did we find anything?
      if (!item) {
        throw new RepositoryItemNotFoundError(
          `Member not found for uri: ${uri}`
        );
      }

      // is it what we expected?
      // will throw error if not
      const memberItem = TribeApiMemberSource.check(item);

      // NOTE: if the response was invalid, an error would have been thrown
      // could this similarly be in a serialisation decorator?
      return TribeApiMemberSourceMapper.toDomain(memberItem, source);
    };

  /**
   * ? should the confirmSourceId also be in a tryCatch or similar?
   */
  findOneByIdSource = (
    value: MemberSourceIdSource
  ): TE.TaskEither<Error, MemberSource> => {
    // NOTE: this will throw an error if the value is invalid
    const id = confirmSourceId<MemberSourceIdSource>(
      MemberSourceIdSource.check(value),
      this.SOURCE
    );
    return this.tribeApiRepository.tryFindOne(
      id,
      this.processFindOne(this.SOURCE)
    );
  };

  findOneByEmail = (value: MemberEmail): TE.TaskEither<Error, MemberSource> => {
    const email = MemberEmail.check(value);
    return this.tribeApiRepository.tryFindOneByEmail(
      email,
      this.processFindOne(this.SOURCE)
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<MemberSourceIdentifier, MemberSourceFindMethod> = {
    idSource: this.findOneByIdSource,
    email: this.findOneByEmail,
  };

  findOne = (identifier: MemberSourceIdentifier): MemberSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  /**
   * This function is handed to the repository to process the response
   */
  processSaveOne =
    (
      source: Source
    ): TribeApiSaveOneProcessMethod<MemberSource, TribeApiMemberSource> =>
    (item) => {
      return TribeApiMemberSourceMapper.toDomain(item, source);
    };

  /**
   * Create a record
   */
  create = (
    memberSource: MemberSourceForCreate
  ): TE.TaskEither<Error, MemberSource> => {
    // NOTE: this will throw an error if the value is invalid
    const entity = TribeApiMemberSourceMapper.toSourceForCreate(memberSource);
    return this.tribeApiRepository.tryCreateOne(
      entity,
      this.processSaveOne(this.SOURCE)
    );
  };

  /**
   * Update a record
   */
  update = (memberSource: MemberSource): TE.TaskEither<Error, MemberSource> => {
    const entity = TribeApiMemberSourceMapper.toSourceForUpdate(memberSource);
    return this.tribeApiRepository.tryUpdateOne(
      memberSource.id,
      entity,
      this.processSaveOne(this.SOURCE)
    );
  };

  /**
   * Delete a record
   */
  delete = (id: MemberSourceId): TE.TaskEither<Error, void> => {
    return this.tribeApiRepository.tryDeleteOne(id);
  };
}
