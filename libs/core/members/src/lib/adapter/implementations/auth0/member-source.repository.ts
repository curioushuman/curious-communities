import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  confirmSourceId,
  SourceRepository,
  Auth0ApiRepositoryProps,
  Auth0ApiRepository,
  Auth0ApiSaveOneProcessMethod,
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
  Auth0ApiMemberSource,
  Auth0ApiMemberSourceForCreate,
} from './entities/member-source';
import { Auth0ApiMemberSourceMapper } from './member-source.mapper';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import { Source } from '../../../domain/value-objects/source';
import { MemberSourceIdSource } from '../../../domain/value-objects/member-source-id-source';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';

@Injectable()
export class Auth0ApiMemberSourceRepository
  implements MemberSourceRepositoryReadWrite, SourceRepository<Source>
{
  private auth0ApiRepository: Auth0ApiRepository<
    MemberSource,
    Auth0ApiMemberSource,
    Auth0ApiMemberSourceForCreate
  >;

  /**
   * The key for this source
   */
  public readonly SOURCE = 'AUTH';

  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    this.logger.setContext(Auth0ApiMemberSourceRepository.name);

    // set up the repository
    const props: Auth0ApiRepositoryProps = {
      sourceName: 'users',
      sourceRuntype: Auth0ApiMemberSource,
    };
    this.auth0ApiRepository = new Auth0ApiRepository(
      props,
      this.httpService,
      this.logger
    );
  }

  processFindOne =
    (source: Source) =>
    (item?: Auth0ApiMemberSource, uri = 'not provided'): MemberSource => {
      // did we find anything?
      if (!item) {
        throw new RepositoryItemNotFoundError(
          `Member not found for uri: ${uri}`
        );
      }

      // is it what we expected?
      // will throw error if not
      const memberItem = Auth0ApiMemberSource.check(item);

      // NOTE: if the response was invalid, an error would have been thrown
      // could this similarly be in a serialisation decorator?
      return Auth0ApiMemberSourceMapper.toDomain(memberItem, source);
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
    return this.auth0ApiRepository.tryFindOne(
      id,
      this.processFindOne(this.SOURCE)
    );
  };

  findOneByEmail = (value: MemberEmail): TE.TaskEither<Error, MemberSource> => {
    const email = MemberEmail.check(value);
    return this.auth0ApiRepository.tryFindOneByEmail(
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
    ): Auth0ApiSaveOneProcessMethod<MemberSource, Auth0ApiMemberSource> =>
    (item) => {
      return Auth0ApiMemberSourceMapper.toDomain(item, source);
    };

  /**
   * Create a record
   */
  create = (
    memberSource: MemberSourceForCreate
  ): TE.TaskEither<Error, MemberSource> => {
    // NOTE: this will throw an error if the value is invalid
    const entity = Auth0ApiMemberSourceMapper.toSourceForCreate(memberSource);
    return this.auth0ApiRepository.tryCreateOne(
      entity,
      this.processSaveOne(this.SOURCE)
    );
  };

  /**
   * Update a record
   */
  update = (memberSource: MemberSource): TE.TaskEither<Error, MemberSource> => {
    const entity = Auth0ApiMemberSourceMapper.toSourceForUpdate(memberSource);
    const { user_id, ...attributes } = entity;
    return this.auth0ApiRepository.tryUpdateOne(
      user_id,
      attributes,
      this.processSaveOne(this.SOURCE)
    );
  };

  /**
   * Delete a record
   */
  delete = (id: MemberSourceId): TE.TaskEither<Error, void> => {
    return this.auth0ApiRepository.tryDeleteOne(id);
  };
}
