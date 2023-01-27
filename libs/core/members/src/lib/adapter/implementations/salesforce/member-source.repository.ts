import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  SalesforceApiQueryField,
  SalesforceApiRepositoryError,
  SalesforceApiSourceRepository,
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
import {
  SalesforceApiMemberSourceResponse,
  SalesforceApiMemberSourceResponses,
} from './entities/member-source.response';
import { SalesforceApiMemberSourceMapper } from './member-source.mapper';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';

@Injectable()
export class SalesforceApiMemberSourceRepository
  extends SalesforceApiSourceRepository
  implements MemberSourceRepository
{
  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    super('Contact', SalesforceApiMemberSourceResponse);
    this.logger.setContext(SalesforceApiMemberSourceRepository.name);
  }

  processFindOne(
    item?: SalesforceApiMemberSourceResponse,
    uri = 'not provided'
  ): MemberSource {
    // did we find anything?
    if (!item) {
      throw new RepositoryItemNotFoundError(`Member not found for uri: ${uri}`);
    }

    // is it what we expected?
    // will throw error if not
    const memberItem = SalesforceApiMemberSourceResponse.check(item);

    // NOTE: if the response was invalid, an error would have been thrown
    // could this similarly be in a serialisation decorator?
    return SalesforceApiMemberSourceMapper.toDomain(memberItem);
  }

  findOneById = (value: MemberSourceId): TE.TaskEither<Error, MemberSource> => {
    return TE.tryCatch(
      async () => {
        const id = MemberSourceId.check(value);
        const uri = this.prepareFindOneUri(id);
        const fields = this.fields();
        const request$ =
          this.httpService.get<SalesforceApiMemberSourceResponse>(uri, {
            params: {
              fields,
            },
          });
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return this.processFindOne(response.data, uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: SalesforceApiRepositoryError) => reason as Error
    );
  };

  findOneByEmail = (value: MemberEmail): TE.TaskEither<Error, MemberSource> => {
    return TE.tryCatch(
      async () => {
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
        const uri = this.prepareQueryUri(values, 'OR');
        // NOTE: this query will return an array of results
        const request$ =
          this.httpService.get<SalesforceApiMemberSourceResponses>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return this.processFindOne(response.data.records?.[0], uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: SalesforceApiRepositoryError) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<MemberSourceIdentifier, MemberSourceFindMethod> = {
    idSource: this.findOneById,
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
