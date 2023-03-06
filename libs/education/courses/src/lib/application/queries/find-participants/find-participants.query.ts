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
import { FindParticipantsDto } from './find-participants.dto';
import { Participant } from '../../../domain/entities/participant';
import { ParticipantRepositoryErrorFactory } from '../../../adapter/ports/participant.repository.error-factory';

export class FindParticipantsQuery implements IQuery {
  constructor(public readonly findParticipantsDto: FindParticipantsDto) {}
}

/**
 * Query handler for find participant
 */
@QueryHandler(FindParticipantsQuery)
export class FindParticipantsHandler
  implements IQueryHandler<FindParticipantsQuery>
{
  constructor(
    private readonly participantRepository: ParticipantRepository,
    private logger: LoggableLogger,
    private participantErrorFactory: ParticipantRepositoryErrorFactory
  ) {
    this.logger.setContext(FindParticipantsHandler.name);
  }

  async execute(query: FindParticipantsQuery): Promise<Participant[]> {
    const { findParticipantsDto } = query;

    const task = pipe(
      findParticipantsDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(
        FindParticipantsDto.check,
        this.logger,
        'InternalRequestInvalidError'
      ),

      // #2. Find the participant
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.participantRepository.findAll,
          this.participantErrorFactory,
          this.logger,
          `find participant: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
