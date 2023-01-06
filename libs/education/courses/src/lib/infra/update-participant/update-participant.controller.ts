import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { UpdateParticipantRequestDto } from './dto/update-participant.request.dto';
import { UpdateParticipantMapper } from '../../application/commands/update-participant/update-participant.mapper';
import { UpdateParticipantCommand } from '../../application/commands/update-participant/update-participant.command';
import { ParticipantResponseDto } from '../dto/participant.response.dto';
import { ParticipantMapper } from '../participant.mapper';

/**
 * Controller for update participant operations
 *
 * NOTES
 * - we initially returned void for create/update actions
 *   see create controller for more info
 *
 * TODO
 * - [ ] should this actually be a service?
 * - [ ] should we be doing auth. here as well?
 *       OR is it ok that we're assuming it is done at higher levels?
 *       AKA it seems like a waste of resources to repeat the same task
 *       ONLY if auth. at this level differs from higher ups should we implement
 */

@Controller()
export class UpdateParticipantController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(UpdateParticipantController.name);
  }

  public async update(
    requestDto: UpdateParticipantRequestDto
  ): Promise<ParticipantResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(UpdateParticipantRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(UpdateParticipantMapper.fromRequestDto, this.logger)
      ),

      // #3. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateParticipantCommand(commandDto);
            return await this.commandBus.execute<UpdateParticipantCommand>(
              command
            );
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(ParticipantMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
