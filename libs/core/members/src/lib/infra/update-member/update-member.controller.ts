import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { UpdateMemberRequestDto } from './dto/update-member.request.dto';
import { UpdateMemberMapper } from '../../application/commands/update-member/update-member.mapper';
import { UpdateMemberCommand } from '../../application/commands/update-member/update-member.command';
import { MemberResponseDto } from '../dto/member.response.dto';
import { MemberMapper } from '../member.mapper';

/**
 * Controller for update member operations
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
export class UpdateMemberController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(UpdateMemberController.name);
  }

  public async update(
    requestDto: UpdateMemberRequestDto
  ): Promise<MemberResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(UpdateMemberRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(parseActionData(UpdateMemberMapper.fromRequestDto, this.logger)),

      // #3. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateMemberCommand(commandDto);
            return await this.commandBus.execute<UpdateMemberCommand>(command);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(MemberMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
