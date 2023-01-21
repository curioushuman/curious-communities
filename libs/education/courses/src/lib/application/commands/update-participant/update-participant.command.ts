import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
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
      parseData(
        UpdateParticipantMapper.fromSourceToParticipant(participant),
        this.logger,
        'SourceInvalidError'
      )(participantSource),

      // #3. make sure an update is required
      parseData(
        UpdateParticipantMapper.requiresUpdate<Participant>(participant),
        this.logger,
        'SourceInvalidError'
      ),

      // #4. update the entity, from the source; if required
      O.fromNullable,
      O.fold(
        // if null, return the original participant
        () => TE.right(participant),
        // otherwise, update and return
        (uc) =>
          performAction(
            uc,
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
