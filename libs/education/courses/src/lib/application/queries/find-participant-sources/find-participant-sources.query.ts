import { QueryHandler, IQueryHandler, IQuery } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantSourceRepository } from '../../../adapter/ports/participant-source.repository';
import { FindParticipantSourcesDto } from './find-participant-sources.dto';
import { ParticipantSource } from '../../../domain/entities/participant-source';
import { ParticipantSourceRepositoryErrorFactory } from '../../../adapter/ports/participant-source.repository.error-factory';
import { RestApiFindAllResponse } from '@curioushuman/common';

export class FindParticipantSourcesQuery implements IQuery {
  constructor(
    public readonly findParticipantSourcesDto: FindParticipantSourcesDto
  ) {}
}

/**
 * Query handler for find participantSource
 *
 * TODO:
 * - [ ] handle paging
 */
@QueryHandler(FindParticipantSourcesQuery)
export class FindParticipantSourcesHandler
  implements IQueryHandler<FindParticipantSourcesQuery>
{
  constructor(
    private readonly participantSourceRepository: ParticipantSourceRepository,
    private logger: LoggableLogger,
    private participantSourceErrorFactory: ParticipantSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(FindParticipantSourcesHandler.name);
  }

  async execute(
    query: FindParticipantSourcesQuery
  ): Promise<RestApiFindAllResponse<ParticipantSource>> {
    const { findParticipantSourcesDto } = query;

    const task = pipe(
      findParticipantSourcesDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(
        FindParticipantSourcesDto.check,
        this.logger,
        'InternalRequestInvalidError'
      ),

      // #2. Find the participantSource
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.participantSourceRepository.findAll,
          this.participantSourceErrorFactory,
          this.logger,
          `find participantSource: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
