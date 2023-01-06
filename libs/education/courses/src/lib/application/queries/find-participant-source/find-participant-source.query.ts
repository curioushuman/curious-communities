import { QueryHandler, IQueryHandler, IQuery } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { ErrorFactory } from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantSourceRepository } from '../../../adapter/ports/participant-source.repository';
import { FindParticipantSourceDto } from './find-participant-source.dto';
import { ParticipantSource } from '../../../domain/entities/participant-source';

export class FindParticipantSourceQuery implements IQuery {
  constructor(
    public readonly findParticipantSourceDto: FindParticipantSourceDto
  ) {}
}

/**
 * Query handler for find participant-source
 */
@QueryHandler(FindParticipantSourceQuery)
export class FindParticipantSourceHandler
  implements IQueryHandler<FindParticipantSourceQuery>
{
  constructor(
    private readonly participantSourceRepository: ParticipantSourceRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(FindParticipantSourceHandler.name);
  }

  async execute(query: FindParticipantSourceQuery): Promise<ParticipantSource> {
    const { findParticipantSourceDto } = query;

    const task = pipe(
      findParticipantSourceDto,
      // #1. parse the dto
      parseActionData(
        FindParticipantSourceDto.check,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. Find the participantSource
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.participantSourceRepository.findOne,
          this.errorFactory,
          this.logger,
          `find participantSource: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
