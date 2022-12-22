import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import {
  ErrorFactory,
  RepositoryItemConflictError,
  RepositoryItemNotFoundError,
} from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantRepository } from '../../../adapter/ports/participant.repository';
import { CreateParticipantDto } from './create-participant.dto';
import { CreateParticipantMapper } from './create-participant.mapper';
import { ParticipantSourceRepository } from '../../../adapter/ports/participant-source.repository';
import { ParticipantSource } from '../../../domain/entities/participant-source';
import { ParticipantMapper } from '../../participant.mapper';

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
    private readonly participantSourceRepository: ParticipantSourceRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateParticipantHandler.name);
  }

  async execute(command: CreateParticipantCommand): Promise<void> {
    const { createParticipantDto } = command;

    const task = pipe(
      // #1. parse the dto
      // we want two DTOs 1. to find source, and 2. find participant
      sequenceT(TE.ApplySeq)(
        parseActionData(
          CreateParticipantMapper.toFindParticipantSourceDto,
          this.logger,
          'RequestInvalidError'
        )(createParticipantDto),
        parseActionData(
          CreateParticipantMapper.toFindParticipantDto,
          this.logger,
          'RequestInvalidError'
        )(createParticipantDto)
      ),

      // #2. Find the source, and the participant (to be updated)
      TE.chain(([findParticipantSourceDto, findParticipantDto]) =>
        sequenceT(TE.ApplySeq)(
          performAction(
            findParticipantSourceDto,
            this.participantSourceRepository.findOne,
            this.errorFactory,
            this.logger,
            `find participant source: ${findParticipantSourceDto.id}`
          ),
          performAction(
            findParticipantDto.value,
            this.participantRepository.checkById,
            this.errorFactory,
            this.logger,
            `check for existing participant: ${findParticipantDto.value}`
          )
        )
      ),

      // #3. validate + transform; participants exists, source is valid, source to participant
      TE.chain(([participantSource, participantExists]) => {
        if (!participantSource) {
          throw new RepositoryItemNotFoundError(
            `Participant source id: ${createParticipantDto.id}`
          );
        }
        if (participantExists === true) {
          throw new RepositoryItemConflictError(
            `Participant id: ${createParticipantDto.id}`
          );
        }
        return pipe(
          participantSource,
          parseActionData(
            ParticipantSource.check,
            this.logger,
            'SourceInvalidError'
          ),
          TE.chain((participantSourceChecked) =>
            parseActionData(
              ParticipantMapper.fromSourceToParticipant,
              this.logger,
              'SourceInvalidError'
            )(participantSourceChecked)
          )
        );
      }),

      // #5. update the participant, from the source
      TE.chain((participant) =>
        performAction(
          participant,
          this.participantRepository.save,
          this.errorFactory,
          this.logger,
          `save participant from source`
        )
      )
    );

    return executeTask(task);
  }
}
