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
import {
  parseUpdateParticipantDto,
  UpdateParticipantDto,
} from './update-participant.dto';
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
      parseData(
        parseUpdateParticipantDto,
        this.logger,
        'InternalRequestInvalidError'
      )
    );

    const { participant } = validDto;

    // #2 validate/parse the group from the DTO
    const parsedParticipant = this.parseDto(validDto);

    const task = pipe(
      parsedParticipant,

      // #4. update the entity, from the source; if required
      O.fromNullable,
      O.fold(
        // if null, return the original participant
        () => {
          this.logger.log(
            `Participant ${participant.id} does not need to be updated from source`
          );
          return TE.right(participant);
        },
        // otherwise, update and return
        (p) =>
          performAction(
            p,
            this.participantRepository.save,
            this.participantErrorFactory,
            this.logger,
            `save participant from source`
          )
      )
    );

    return executeTask(task);
  }

  parseDto(validDto: UpdateParticipantDto): Participant | undefined {
    const { participant, participantSource } = validDto;
    // if no participantSource it means we're doing a straight update
    // so we skip the requiresUpdate check
    if (!participantSource) {
      return participant;
    }
    return pipe(
      participantSource,
      // #4. update the entity, from the participant/source
      parseData(
        UpdateParticipantMapper.fromSourceToParticipant(participant),
        this.logger,
        'SourceInvalidError'
      ),
      // #3. make sure an update is required
      parseData(
        UpdateParticipantMapper.requiresUpdate<Participant>(participant),
        this.logger,
        'InternalRequestInvalidError'
      )
    );
  }
}
