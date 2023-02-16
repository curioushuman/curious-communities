import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';
import { CreateGroupMemberDto } from './create-group-member.dto';
import { CreateGroupMemberMapper } from './create-group-member.mapper';
import { GroupMember } from '../../../domain/entities/group-member';
import { GroupMemberRepositoryErrorFactory } from '../../../adapter/ports/group-member.repository.error-factory';

export class CreateGroupMemberCommand implements ICommand {
  constructor(public readonly createGroupMemberDto: CreateGroupMemberDto) {}
}

/**
 * Command handler for create groupMember
 * TODO
 * - [ ] better associated groupMember check
 *       e.g. check against local IDs rather than just existence of groupMemberId
 */
@CommandHandler(CreateGroupMemberCommand)
export class CreateGroupMemberHandler
  implements ICommandHandler<CreateGroupMemberCommand>
{
  constructor(
    private readonly groupMemberRepository: GroupMemberRepository,
    private logger: LoggableLogger,
    private groupMemberErrorFactory: GroupMemberRepositoryErrorFactory
  ) {
    this.logger.setContext(CreateGroupMemberHandler.name);
  }

  async execute(command: CreateGroupMemberCommand): Promise<GroupMember> {
    const { createGroupMemberDto } = command;

    const task = pipe(
      createGroupMemberDto,
      // #1. validate the dto
      parseData(
        CreateGroupMemberDto.check,
        this.logger,
        'InternalRequestInvalidError'
      ),
      // #2. transform the dto into a group
      parseActionData(
        CreateGroupMemberMapper.fromDto,
        this.logger,
        'InternalRequestInvalidError'
      ),
      // #3. save the group
      TE.chain((groupMember) =>
        performAction(
          groupMember,
          this.groupMemberRepository.save,
          this.groupMemberErrorFactory,
          this.logger,
          `save groupMember`
        )
      )
    );

    return executeTask(task);
  }
}
