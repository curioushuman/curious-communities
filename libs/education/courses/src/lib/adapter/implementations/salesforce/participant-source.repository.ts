import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  confirmSourceId,
  SalesforceApiRepository,
  SourceRepository,
  SalesforceApiRepositoryProps,
  SalesforceApiQueryField,
  RestApiFindAllResponse,
} from '@curioushuman/common';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';

import {
  ParticipantSource,
  ParticipantSourceIdentifier,
} from '../../../domain/entities/participant-source';
import {
  ParticipantSourceFindMethod,
  ParticipantSourceRepository,
} from '../../ports/participant-source.repository';
import { SalesforceApiParticipantSource } from './entities/participant-source';
import { SalesforceApiParticipantSourceMapper } from './participant-source.mapper';
import { Source } from '../../../domain/value-objects/source';
import { ParticipantSourceIdSource } from '../../../domain/value-objects/participant-source-id-source';
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';

@Injectable()
export class SalesforceApiParticipantSourceRepository
  implements ParticipantSourceRepository, SourceRepository<Source>
{
  private salesforceApiRepository: SalesforceApiRepository<
    ParticipantSource,
    SalesforceApiParticipantSource
  >;

  /**
   * The key for this source
   */
  public readonly SOURCE = 'COURSE';

  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    this.logger.setContext(SalesforceApiParticipantSourceRepository.name);

    // set up the repository
    const props: SalesforceApiRepositoryProps = {
      sourceName: 'Participant__c',
      sourceRuntype: SalesforceApiParticipantSource,
    };
    this.salesforceApiRepository = new SalesforceApiRepository(
      props,
      this.httpService,
      this.logger
    );
  }

  processFindOne =
    (source: Source) =>
    (
      item?: SalesforceApiParticipantSource,
      uri = 'not provided'
    ): ParticipantSource => {
      // did we find anything?
      if (!item) {
        throw new RepositoryItemNotFoundError(
          `Participant not found for uri: ${uri}`
        );
      }

      this.logger.debug(item, 'processFindOne');

      // is it what we expected?
      // will throw error if not
      const participantItem = SalesforceApiParticipantSource.check(item);

      // NOTE: if the response was invalid, an error would have been thrown
      // could this similarly be in a serialisation decorator?
      return SalesforceApiParticipantSourceMapper.toDomain(
        participantItem,
        source
      );
    };

  /**
   * ? should the confirmSourceId also be in a tryCatch or similar?
   */
  findOneByIdSource = (
    value: ParticipantSourceIdSource
  ): TE.TaskEither<Error, ParticipantSource> => {
    // NOTE: this will throw an error if the value is invalid
    const id = confirmSourceId<ParticipantSourceIdSource>(
      ParticipantSourceIdSource.check(value),
      this.SOURCE
    );
    return this.salesforceApiRepository.tryFindOne(
      id,
      this.processFindOne(this.SOURCE)
    );
  };

  processFindAll =
    (source: Source) =>
    (item: SalesforceApiParticipantSource): ParticipantSource => {
      // is it what we expected?
      // will throw error if not
      const participantItem = SalesforceApiParticipantSource.check(item);

      // NOTE: if the response was invalid, an error would have been thrown
      // could this similarly be in a serialisation decorator?
      return SalesforceApiParticipantSourceMapper.toDomain(
        participantItem,
        source
      );
    };

  /**
   * ! NOTE: does not yet support paging
   */
  findAll = (props: {
    parentId: CourseSourceId;
  }): TE.TaskEither<Error, RestApiFindAllResponse<ParticipantSource>> => {
    const courseSourceId = CourseSourceId.check(props.parentId);
    const values: SalesforceApiQueryField[] = [
      {
        field: 'Case__c',
        value: courseSourceId,
      },
    ];
    return this.salesforceApiRepository.tryQueryAll(
      values,
      this.processFindAll(this.SOURCE)
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<ParticipantSourceIdentifier, ParticipantSourceFindMethod> =
    {
      idSource: this.findOneByIdSource,
    };

  findOne = (
    identifier: ParticipantSourceIdentifier
  ): ParticipantSourceFindMethod => {
    return this.findOneBy[identifier];
  };
}
