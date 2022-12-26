import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { UpdateGroupMemberRequestDto } from './dto/update-group-member.request.dto';
import { UpdateGroupMemberMapper } from '../../application/commands/update-group-member/update-group-member.mapper';
import { UpdateGroupMemberCommand } from '../../application/commands/update-group-member/update-group-member.command';

/**
 * Controller for update group-member operations
 *
 * TODO
 * - [ ] should this actually be a service?
 * - [ ] should we be doing auth. here as well?
 *       OR is it ok that we're assuming it is done at higher levels?
 *       AKA it seems like a waste of resources to repeat the same task
 *       ONLY if auth. at this level differs from higher ups should we implement
 */

@Controller()
export class UpdateGroupMemberController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(UpdateGroupMemberController.name);
  }

  public async update(requestDto: UpdateGroupMemberRequestDto): Promise<void> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(UpdateGroupMemberRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(UpdateGroupMemberMapper.fromRequestDto, this.logger)
      ),

      // #3. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateGroupMemberCommand(commandDto);
            return await this.commandBus.execute<UpdateGroupMemberCommand>(
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
