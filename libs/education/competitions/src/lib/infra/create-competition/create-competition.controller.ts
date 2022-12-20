import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CreateCompetitionRequestDto } from './dto/create-competition.request.dto';
import { CreateCompetitionMapper } from '../../application/commands/create-competition/create-competition.mapper';
import { CreateCompetitionCommand } from '../../application/commands/create-competition/create-competition.command';

/**
 * Controller for create competition operations
 *
 * TODO
 * - [ ] should this actually be a service?
 * - [ ] should we be doing auth. here as well?
 *       OR is it ok that we're assuming it is done at higher levels?
 *       AKA it seems like a waste of resources to repeat the same task
 *       ONLY if auth. at this level differs from higher ups should we implement
 */

@Controller()
export class CreateCompetitionController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(CreateCompetitionController.name);
  }

  public async create(requestDto: CreateCompetitionRequestDto): Promise<void> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(CreateCompetitionRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(CreateCompetitionMapper.fromRequestDto, this.logger)
      ),

      // #3. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateCompetitionCommand(commandDto);
            return await this.commandBus.execute<CreateCompetitionCommand>(
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
