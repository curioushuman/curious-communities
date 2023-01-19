import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantRepository } from '../../../adapter/ports/participant.repository';
import { UpdateParticipantDto } from './update-participant.dto';
import { UpdateParticipantMapper } from './update-participant.mapper';
import { Participant } from '../../../domain/entities/participant';
import { ParticipantRepositoryErrorFactory } from '../../../adapter/ports/participant.repository.error-factory';

export class UpdateParticipantCommand implements ICommand {
  constructor(public readonly updateParticipantDto: UpdateParticipantDto) {}
}

/**
 * Command handler for update participant
 * TODO
 * - [ ] better associated participant check
 *       e.g. check against local IDs rather than just existence of participantId
 */
@CommandHandler(UpdateParticipantCommand)
export class UpdateParticipantHandler
  implements ICommandHandler<UpdateParticipantCommand>
{
  constructor(
    private readonly participantRepository: ParticipantRepository,
    private logger: LoggableLogger,
    private participantErrorFactory: ParticipantRepositoryErrorFactory
  ) {
    this.logger.setContext(UpdateParticipantHandler.name);
  }

  async execute(command: UpdateParticipantCommand): Promise<Participant> {
    const { updateParticipantDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      updateParticipantDto,
      parseData(UpdateParticipantDto.check, this.logger, 'SourceInvalidError')
    );

    const { participant, participantSource } = validDto;

    const task = pipe(
      // #2. prepare entity for update
      parseActionData(
        UpdateParticipantMapper.fromSourceToParticipant(participant),
        this.logger,
        'SourceInvalidError'
      )(participantSource),

      // #3. update the entity, from the source
      TE.chain((participant) =>
        performAction(
          participant,
          this.participantRepository.save,
          this.participantErrorFactory,
          this.logger,
          `save participant from source`
        )
      )
    );

    return executeTask(task);
  }
}
