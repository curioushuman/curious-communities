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

import { GroupMemberSourceRepositoryReadWrite } from '../../../adapter/ports/group-member-source.repository';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import {
  CreateGroupMemberSourceDto,
  parseCreateGroupMemberSourceDto,
} from './create-group-member-source.dto';
import { CreateGroupMemberSourceMapper } from './create-group-member-source.mapper';
import { GroupMemberSourceRepositoryErrorFactory } from '../../../adapter/ports/group-member-source.repository.error-factory';

export class CreateGroupMemberSourceCommand implements ICommand {
  constructor(
    public readonly createGroupMemberSourceDto: CreateGroupMemberSourceDto
  ) {}
}

/**
 * Command handler for create groupMember source
 */
@CommandHandler(CreateGroupMemberSourceCommand)
export class CreateGroupMemberSourceHandler
  implements ICommandHandler<CreateGroupMemberSourceCommand>
{
  constructor(
    private readonly groupMemberSourceRepository: GroupMemberSourceRepositoryReadWrite,
    private logger: LoggableLogger,
    private groupMemberRepositoryErrorFactory: GroupMemberSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(CreateGroupMemberSourceHandler.name);
  }

  async execute(
    command: CreateGroupMemberSourceCommand
  ): Promise<GroupMemberSource> {
    const { createGroupMemberSourceDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      createGroupMemberSourceDto,
      parseData(
        parseCreateGroupMemberSourceDto,
        this.logger,
        'InternalRequestInvalidError'
      )
    );

    const { groupSource, groupMember } = validDto;

    const task = pipe(
      groupMember,
      // #2. populate groupMember source
      parseActionData(
        CreateGroupMemberSourceMapper.fromGroupMemberToSource(groupSource),
        this.logger,
        'InternalRequestInvalidError'
      ),

      // #3. create the groupMember source
      TE.chain((groupMemberSourceForCreate) =>
        performAction(
          groupMemberSourceForCreate,
          this.groupMemberSourceRepository.create,
          this.groupMemberRepositoryErrorFactory,
          this.logger,
          `save groupMember source`
        )
      )
    );

    return executeTask(task);
  }
}
