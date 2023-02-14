import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';
import {
  parseUpdateGroupMemberDto,
  UpdateGroupMemberDto,
} from './update-group-member.dto';
import { UpdateGroupMemberMapper } from './update-group-member.mapper';
import {
  GroupMember,
  GroupMemberBase,
} from '../../../domain/entities/group-member';
import { GroupMemberRepositoryErrorFactory } from '../../../adapter/ports/group-member.repository.error-factory';
import { RepositoryItemUpdateError } from '@curioushuman/error-factory';

export class UpdateGroupMemberCommand implements ICommand {
  constructor(public readonly updateGroupMemberDto: UpdateGroupMemberDto) {}
}

/**
 * Command handler for update groupMember
 * TODO
 * - [ ] better associated groupMember check
 *       e.g. check against local IDs rather than just existence of groupMemberId
 */
@CommandHandler(UpdateGroupMemberCommand)
export class UpdateGroupMemberHandler
  implements ICommandHandler<UpdateGroupMemberCommand>
{
  constructor(
    private readonly groupMemberRepository: GroupMemberRepository,
    private logger: LoggableLogger,
    private groupMemberErrorFactory: GroupMemberRepositoryErrorFactory
  ) {
    this.logger.setContext(UpdateGroupMemberHandler.name);
  }

  async execute(command: UpdateGroupMemberCommand): Promise<GroupMember> {
    const { updateGroupMemberDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      updateGroupMemberDto,
      parseData(
        parseUpdateGroupMemberDto,
        this.logger,
        'InternalRequestInvalidError'
      )
    );

    // #2 grab the groupMember out
    const { groupMember } = validDto;

    const task = pipe(
      validDto,
      // #4. update the entity, from the course/source
      parseData(
        UpdateGroupMemberMapper.fromDto,
        this.logger,
        'InternalRequestInvalidError'
      ),
      // #3. make sure an update is required
      parseData(
        UpdateGroupMemberMapper.requiresUpdate<GroupMemberBase>(groupMember),
        this.logger,
        'InternalRequestInvalidError'
      ),

      // #4. update the entity, from the source; if required
      O.fromNullable,
      O.fold(
        // if null, return the original group
        () => {
          const msg = `GroupMember ${groupMember.id} does not need to be updated from source`;
          // as we catch this error above, it is no longer logged
          // so let's log it manually for a complete audit trail
          this.logger.error(msg);
          throw new RepositoryItemUpdateError(msg);
        },
        // otherwise, update and return
        (g) =>
          performAction(
            g,
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
