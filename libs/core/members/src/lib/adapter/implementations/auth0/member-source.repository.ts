import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  confirmSourceId,
  SourceRepository,
  Auth0ApiRepositoryProps,
  Auth0ApiRepository,
} from '@curioushuman/common';

import {
  MemberSource,
  MemberSourceForCreate,
  MemberSourceIdentifier,
} from '../../../domain/entities/member-source';
import {
  MemberSourceFindMethod,
  MemberSourceRepository,
} from '../../ports/member-source.repository';
import { Auth0ApiMemberSourceResponse } from './entities/member-source.response';
import { Auth0ApiMemberSourceMapper } from './member-source.mapper';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import { Source } from '../../../domain/value-objects/source';
import { MemberSourceIdSource } from '../../../domain/value-objects/member-source-id-source';

@Injectable()
export class Auth0ApiMemberSourceRepository
  implements MemberSourceRepository, SourceRepository<Source>
{
  private auth0ApiRepository: Auth0ApiRepository<
    MemberSource,
    Auth0ApiMemberSourceResponse
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
      responseRuntype: Auth0ApiMemberSourceResponse,
    };
    this.auth0ApiRepository = new Auth0ApiRepository(
      props,
      this.httpService,
      this.logger
    );
  }

  processFindOne =
    (source: Source) =>
    (
      item?: Auth0ApiMemberSourceResponse,
      uri = 'not provided'
    ): MemberSource => {
      // did we find anything?
      if (!item) {
        throw new RepositoryItemNotFoundError(
          `Member not found for uri: ${uri}`
        );
      }

      // is it what we expected?
      // will throw error if not
      const memberItem = Auth0ApiMemberSourceResponse.check(item);

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

  create = (
    memberSource: MemberSourceForCreate
  ): TE.TaskEither<Error, MemberSource> => {
    return TE.tryCatch(
      async () => {
        // DO NOTHING
        this.logger.debug(`Temp non-save of ${memberSource.email}`);
        return {
          ...memberSource,
          id: 'temp-id',
        } as MemberSource;
      },
      (reason: unknown) => reason as Error
    );
  };

  update = (memberSource: MemberSource): TE.TaskEither<Error, MemberSource> => {
    return TE.tryCatch(
      async () => {
        // DO NOTHING
        this.logger.debug(`Temp non-save of ${memberSource.id}`);
        return {
          ...memberSource,
        } as MemberSource;
      },
      (reason: unknown) => reason as Error
    );
  };
}
