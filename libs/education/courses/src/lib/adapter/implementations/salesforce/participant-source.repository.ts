import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  SalesforceApiRepositoryError,
  SalesforceApiSourceRepository,
} from '@curioushuman/common';

import {
  ParticipantSource,
  ParticipantSourceIdentifier,
} from '../../../domain/entities/participant-source';
import {
  ParticipantSourceFindMethod,
  ParticipantSourceRepository,
} from '../../ports/participant-source.repository';
import { SalesforceApiParticipantSourceResponse } from './types/participant-source.response';
import { SalesforceApiParticipantSourceMapper } from './participant-source.mapper';
import { ParticipantSourceId } from '../../../domain/value-objects/participant-source-id';

@Injectable()
export class SalesforceApiParticipantSourceRepository
  extends SalesforceApiSourceRepository
  implements ParticipantSourceRepository
{
  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    super('Participant__c', SalesforceApiParticipantSourceResponse);
    this.logger.setContext(SalesforceApiParticipantSourceRepository.name);
  }

  findOneById = (
    value: ParticipantSourceId
  ): TE.TaskEither<Error, ParticipantSource> => {
    return TE.tryCatch(
      async () => {
        const id = ParticipantSourceId.check(value);
        const endpoint = this.prepareFindOneUri(id);
        const fields = this.fields();
        const request$ =
          this.httpService.get<SalesforceApiParticipantSourceResponse>(
            endpoint,
            {
              params: {
                fields,
              },
            }
          );
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        // NOTE: if the response was invalid, an error would have been thrown
        // could this similarly be in a serialisation decorator?
        return SalesforceApiParticipantSourceMapper.toDomain(response.data);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: SalesforceApiRepositoryError) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<ParticipantSourceIdentifier, ParticipantSourceFindMethod> =
    {
      idSource: this.findOneById,
    };

  findOne = (
    identifier: ParticipantSourceIdentifier
  ): ParticipantSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  save = (participantSource: ParticipantSource): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        // DO NOTHING
        this.logger.debug(`Temp non-save of ${participantSource.id}`);
      },
      (reason: unknown) => reason as Error
    );
  };
}
