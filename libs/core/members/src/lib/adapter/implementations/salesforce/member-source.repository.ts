import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  confirmSourceId,
  SalesforceApiQueryField,
  SalesforceApiRepository,
  SourceRepository,
  SalesforceApiRepositoryProps,
  SalesforceApiFindOneProcessMethod,
} from '@curioushuman/common';

import {
  MemberSource,
  MemberSourceIdentifier,
} from '../../../domain/entities/member-source';
import {
  MemberSourceFindMethod,
  MemberSourceRepository,
} from '../../ports/member-source.repository';
import { SalesforceApiMemberSource } from './entities/member-source';
import { SalesforceApiMemberSourceMapper } from './member-source.mapper';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import { Source } from '../../../domain/value-objects/source';
import { MemberSourceIdSource } from '../../../domain/value-objects/member-source-id-source';

@Injectable()
export class SalesforceApiMemberSourceRepository
  implements MemberSourceRepository, SourceRepository<Source>
{
  private salesforceApiRepository: SalesforceApiRepository<
    MemberSource,
    SalesforceApiMemberSource
  >;

  /**
   * The key for this source
   */
  public readonly SOURCE = 'CRM';

  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    this.logger.setContext(SalesforceApiMemberSourceRepository.name);

    // set up the repository
    const props: SalesforceApiRepositoryProps = {
      sourceName: 'Contact',
      sourceRuntype: SalesforceApiMemberSource,
    };
    this.salesforceApiRepository = new SalesforceApiRepository(
      props,
      this.httpService,
      this.logger
    );
  }

  /**
   * This function is handed to the repository to process the response
   */
  processFindOne =
    (
      source: Source
    ): SalesforceApiFindOneProcessMethod<
      MemberSource,
      SalesforceApiMemberSource
    > =>
    (item?, uri = 'not provided') => {
      // did we find anything?
      if (!item) {
        throw new RepositoryItemNotFoundError(
          `Member not found for uri: ${uri}`
        );
      }

      // is it what we expected?
      // will throw error if not
      const memberItem = SalesforceApiMemberSource.check(item);

      // NOTE: if the response was invalid, an error would have been thrown
      // could this similarly be in a serialisation decorator?
      return SalesforceApiMemberSourceMapper.toDomain(memberItem, source);
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
    return this.salesforceApiRepository.tryFindOne(
      id,
      this.processFindOne(this.SOURCE)
    );
  };

  findOneByEmail = (value: MemberEmail): TE.TaskEither<Error, MemberSource> => {
    const email = MemberEmail.check(value);
    const values: SalesforceApiQueryField[] = [
      {
        field: 'Email',
        value: email,
      },
      {
        field: 'npe01__HomeEmail__c',
        value: email,
      },
      {
        field: 'npe01__WorkEmail__c',
        value: email,
      },
      {
        field: 'npe01__AlternateEmail__c',
        value: email,
      },
    ];
    return this.salesforceApiRepository.tryQueryOne(
      values,
      'OR',
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
   * ! NOT YET REQUIRED
   * This function is handed to the repository to process the response
   */
  // processSaveOne =
  //   (
  //     source: Source
  //   ): SalesforceApiSaveOneProcessMethod<
  //     MemberSource,
  //     SalesforceApiMemberSource
  //   > =>
  //   (item) => {
  //     return SalesforceApiMemberSourceMapper.toDomain(item, source);
  //   };

  /**
   * ! NOT YET REQUIRED
   */
  // create = (
  //   memberSource: MemberSourceForCreate
  // ): TE.TaskEither<Error, MemberSource> => {
  //   // NOTE: this will throw an error if the value is invalid
  //   const entity =
  //     SalesforceApiMemberSourceMapper.toSourceForCreate(memberSource);
  //   return this.salesforceApiRepository.tryCreateOne(
  //     entity,
  //     this.processSaveOne(this.SOURCE)
  //   );
  // };

  /**
   * ! NOT YET REQUIRED
   */
  // update = (memberSource: MemberSource): TE.TaskEither<Error, MemberSource> => {
  //   const entity =
  //     SalesforceApiMemberSourceMapper.toSourceForUpdate(memberSource);
  //   const { Id, ...attributes } = entity;
  //   return this.salesforceApiRepository.tryUpdateOne(
  //     Id,
  //     attributes,
  //     this.processSaveOne(this.SOURCE)
  //   );
  // };
}
