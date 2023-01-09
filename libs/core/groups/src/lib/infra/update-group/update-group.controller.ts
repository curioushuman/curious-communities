import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { UpdateGroupRequestDto } from './dto/update-group.request.dto';
import { UpdateGroupMapper } from '../../application/commands/update-group/update-group.mapper';
import { UpdateGroupCommand } from '../../application/commands/update-group/update-group.command';
import { GroupResponseDto } from '../dto/group.response.dto';
import { GroupMapper } from '../group.mapper';

/**
 * Controller for update group operations
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
export class UpdateGroupController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(UpdateGroupController.name);
  }

  public async update(
    requestDto: UpdateGroupRequestDto
  ): Promise<GroupResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(UpdateGroupRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(parseActionData(UpdateGroupMapper.fromRequestDto, this.logger)),

      // #3. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateGroupCommand(commandDto);
            return await this.commandBus.execute<UpdateGroupCommand>(command);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(GroupMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
