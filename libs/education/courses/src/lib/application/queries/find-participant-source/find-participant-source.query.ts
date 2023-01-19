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
import {
  FindParticipantSourceDto,
  parseDto,
} from './find-participant-source.dto';
import { ParticipantSource } from '../../../domain/entities/participant-source';
import { ParticipantSourceRepositoryErrorFactory } from '../../../adapter/ports/participant-source.repository.error-factory';

export class FindParticipantSourceQuery implements IQuery {
  constructor(
    public readonly findParticipantSourceDto: FindParticipantSourceDto
  ) {}
}

/**
 * Query handler for find participant
 */
@QueryHandler(FindParticipantSourceQuery)
export class FindParticipantSourceHandler
  implements IQueryHandler<FindParticipantSourceQuery>
{
  constructor(
    private readonly participantSourceRepository: ParticipantSourceRepository,
    private logger: LoggableLogger,
    private participantSourceErrorFactory: ParticipantSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(FindParticipantSourceHandler.name);
  }

  async execute(query: FindParticipantSourceQuery): Promise<ParticipantSource> {
    const { findParticipantSourceDto } = query;

    const task = pipe(
      findParticipantSourceDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the participant
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.participantSourceRepository.findOne(
            findParticipantSourceDto.identifier
          ),
          this.participantSourceErrorFactory,
          this.logger,
          `find participant: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
