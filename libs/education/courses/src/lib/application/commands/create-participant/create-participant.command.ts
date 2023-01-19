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
import { CreateParticipantDto } from './create-participant.dto';
import { CreateParticipantMapper } from './create-participant.mapper';
import { Participant } from '../../../domain/entities/participant';
import { ParticipantRepositoryErrorFactory } from '../../../adapter/ports/participant.repository.error-factory';

export class CreateParticipantCommand implements ICommand {
  constructor(public readonly createParticipantDto: CreateParticipantDto) {}
}

/**
 * Command handler for create participant
 * TODO
 * - [ ] better associated participant check
 *       e.g. check against local IDs rather than just existence of participantId
 */
@CommandHandler(CreateParticipantCommand)
export class CreateParticipantHandler
  implements ICommandHandler<CreateParticipantCommand>
{
  constructor(
    private readonly participantRepository: ParticipantRepository,
    private logger: LoggableLogger,
    private participantErrorFactory: ParticipantRepositoryErrorFactory
  ) {
    this.logger.setContext(CreateParticipantHandler.name);
  }

  async execute(command: CreateParticipantCommand): Promise<Participant> {
    const { createParticipantDto } = command;

    // #1. validate the dto
    // NOTE: we have decided to do this here, no matter if it is a double
    // up in some instances. It is one of the responsibilities of the command handler
    // to validate the data it receives.
    const validDto = pipe(
      createParticipantDto,
      parseData(CreateParticipantDto.check, this.logger, 'SourceInvalidError')
    );

    const { participantSource, course, member } = validDto;

    const task = pipe(
      // #1. parse the dto and prepare the participant record
      participantSource,
      parseActionData(
        CreateParticipantMapper.fromSourceToParticipant,
        this.logger,
        'RequestInvalidError'
      ),
      TE.chain((participantFromSource) =>
        parseActionData(
          CreateParticipantMapper.fromCourseToParticipant(course),
          this.logger,
          'RequestInvalidError'
        )(participantFromSource)
      ),
      TE.chain((participantWithSourceAndCourse) =>
        parseActionData(
          CreateParticipantMapper.fromMemberToParticipant(member),
          this.logger,
          'RequestInvalidError'
        )(participantWithSourceAndCourse)
      ),

      // #2. create the participant
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
