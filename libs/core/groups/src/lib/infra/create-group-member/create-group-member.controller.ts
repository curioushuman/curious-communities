import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CreateGroupMemberRequestDto } from './dto/create-group-member.request.dto';
import { CreateGroupMemberMapper } from '../../application/commands/create-group-member/create-group-member.mapper';
import { CreateGroupMemberCommand } from '../../application/commands/create-group-member/create-group-member.command';

/**
 * Controller for create group-member operations
 *
 * TODO
 * - [ ] should this actually be a service?
 * - [ ] should we be doing auth. here as well?
 *       OR is it ok that we're assuming it is done at higher levels?
 *       AKA it seems like a waste of resources to repeat the same task
 *       ONLY if auth. at this level differs from higher ups should we implement
 */

@Controller()
export class CreateGroupMemberController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(CreateGroupMemberController.name);
  }

  public async create(requestDto: CreateGroupMemberRequestDto): Promise<void> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(CreateGroupMemberRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(CreateGroupMemberMapper.fromRequestDto, this.logger)
      ),

      // #3. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateGroupMemberCommand(commandDto);
            return await this.commandBus.execute<CreateGroupMemberCommand>(
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
