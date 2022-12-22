import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CreateGroupRequestDto } from './dto/create-group.request.dto';
import { CreateGroupMapper } from '../../application/commands/create-group/create-group.mapper';
import { CreateGroupCommand } from '../../application/commands/create-group/create-group.command';

/**
 * Controller for create group operations
 *
 * TODO
 * - [ ] should this actually be a service?
 * - [ ] should we be doing auth. here as well?
 *       OR is it ok that we're assuming it is done at higher levels?
 *       AKA it seems like a waste of resources to repeat the same task
 *       ONLY if auth. at this level differs from higher ups should we implement
 */

@Controller()
export class CreateGroupController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(CreateGroupController.name);
  }

  public async create(requestDto: CreateGroupRequestDto): Promise<void> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(CreateGroupRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(parseActionData(CreateGroupMapper.fromRequestDto, this.logger)),

      // #3. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateGroupCommand(commandDto);
            return await this.commandBus.execute<CreateGroupCommand>(command);
          },
          (error: unknown) => error as Error
        )
      )
    );

    return executeTask(task);
  }
}
