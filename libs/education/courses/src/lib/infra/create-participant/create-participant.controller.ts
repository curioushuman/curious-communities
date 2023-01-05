import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CreateParticipantRequestDto } from './dto/create-participant.request.dto';
import { CreateParticipantMapper } from '../../application/commands/create-participant/create-participant.mapper';
import { CreateParticipantCommand } from '../../application/commands/create-participant/create-participant.command';

/**
 * Controller for create participant operations
 *
 * TODO
 * - [ ] should this actually be a service?
 * - [ ] should we be doing auth. here as well?
 *       OR is it ok that we're assuming it is done at higher levels?
 *       AKA it seems like a waste of resources to repeat the same task
 *       ONLY if auth. at this level differs from higher ups should we implement
 */

@Controller()
export class CreateParticipantController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(CreateParticipantController.name);
  }

  /**
   * This version of create assumes it is coming from step functions
   * that do a lot of the heavy lifting. It doesn't run any checks, apart
   * from validating the request dto.
   */
  public async create(requestDto: CreateParticipantRequestDto): Promise<void> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(CreateParticipantRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(CreateParticipantMapper.fromRequestDto, this.logger)
      ),

      // #3. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateParticipantCommand(commandDto);
            return await this.commandBus.execute<CreateParticipantCommand>(
              command
            );
          },
          (error: unknown) => error as Error
        )
      )
    );

    return executeTask(task);
  }
}
