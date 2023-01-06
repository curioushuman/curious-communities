import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import {
  ErrorFactory,
  RepositoryItemNotFoundError,
} from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantRepository } from '../../../adapter/ports/participant.repository';
import { UpdateParticipantDto } from './update-participant.dto';
import { UpdateParticipantMapper } from './update-participant.mapper';
import { ParticipantSourceRepository } from '../../../adapter/ports/participant-source.repository';
import { ParticipantSource } from '../../../domain/entities/participant-source';
import { Participant } from '../../../domain/entities/participant';

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
    private readonly participantSourceRepository: ParticipantSourceRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(UpdateParticipantHandler.name);
  }

  async execute(command: UpdateParticipantCommand): Promise<Participant> {
    const { updateParticipantDto } = command;

    const task = pipe(
      // #1. parse the dto
      // we want two DTOs 1. to find source, and 2. find participant
      sequenceT(TE.ApplySeq)(
        parseActionData(
          UpdateParticipantMapper.toFindParticipantSourceDto,
          this.logger,
          'RequestInvalidError'
        )(updateParticipantDto),
        parseActionData(
          UpdateParticipantMapper.toFindParticipantDto,
          this.logger,
          'RequestInvalidError'
        )(updateParticipantDto)
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
            this.participantRepository.findOne(findParticipantDto.identifier),
            this.errorFactory,
            this.logger,
            `find participant: ${findParticipantDto.value}`
          )
        )
      ),

      // #3. validate + transform; participants exists, source is valid, source to participant
      TE.chain(([participantSource, existingParticipant]) => {
        if (!participantSource) {
          throw new RepositoryItemNotFoundError(
            `Participant source id: ${updateParticipantDto.id}`
          );
        }
        if (!existingParticipant) {
          throw new RepositoryItemNotFoundError(
            `Participant id: ${updateParticipantDto.id}`
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
              UpdateParticipantMapper.fromSourceToParticipant(
                existingParticipant
              ),
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
