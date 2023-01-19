import { QueryHandler, IQueryHandler, IQuery } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantRepository } from '../../../adapter/ports/participant.repository';
import { FindParticipantDto, parseDto } from './find-participant.dto';
import { Participant } from '../../../domain/entities/participant';
import { ParticipantRepositoryErrorFactory } from '../../../adapter/ports/participant.repository.error-factory';

export class FindParticipantQuery implements IQuery {
  constructor(public readonly findParticipantDto: FindParticipantDto) {}
}

/**
 * Query handler for find participant
 */
@QueryHandler(FindParticipantQuery)
export class FindParticipantHandler
  implements IQueryHandler<FindParticipantQuery>
{
  constructor(
    private readonly participantRepository: ParticipantRepository,
    private logger: LoggableLogger,
    private participantErrorFactory: ParticipantRepositoryErrorFactory
  ) {
    this.logger.setContext(FindParticipantHandler.name);
  }

  async execute(query: FindParticipantQuery): Promise<Participant> {
    const { findParticipantDto } = query;

    const task = pipe(
      findParticipantDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the participant
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.participantRepository.findOne(findParticipantDto.identifier),
          this.participantErrorFactory,
          this.logger,
          `find participant: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
