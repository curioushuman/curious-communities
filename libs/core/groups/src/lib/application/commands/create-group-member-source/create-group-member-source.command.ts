import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { ErrorFactory } from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  GroupMemberSourceCommunityRepository,
  GroupMemberSourceMicroCourseRepository,
  GroupMemberSourceRepository,
} from '../../../adapter/ports/group-member-source.repository';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { CreateGroupMemberSourceDto } from './create-group-member-source.dto';
import { CreateGroupMemberSourceMapper } from './create-group-member-source.mapper';

export class CreateGroupMemberSourceCommand implements ICommand {
  constructor(
    public readonly createGroupMemberSourceDto: CreateGroupMemberSourceDto
  ) {}
}

/**
 * Command handler for create group source
 * TODO
 * - [ ] move the source repository selection to a separate service
 * - [ ] this shouldn't be accepting findDtos, doesn't feel right
 *       requires more thought. Look at upsert for example.
 */
@CommandHandler(CreateGroupMemberSourceCommand)
export class CreateGroupMemberSourceHandler
  implements ICommandHandler<CreateGroupMemberSourceCommand>
{
  constructor(
    private readonly groupMemberSourceCommunityRepository: GroupMemberSourceCommunityRepository,
    private readonly groupMemberSourceMicroCourseRepository: GroupMemberSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateGroupMemberSourceHandler.name);
  }

  async execute(
    command: CreateGroupMemberSourceCommand
  ): Promise<GroupMemberSource> {
    const { createGroupMemberSourceDto } = command;

    // we can safely destructure as the DTO has been validated in mapper
    const { source, groupMember } = createGroupMemberSourceDto;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, GroupMemberSourceRepository> = {
      COMMUNITY: this.groupMemberSourceCommunityRepository,
      'MICRO-COURSE': this.groupMemberSourceMicroCourseRepository,
    };

    const task = pipe(
      // createGroupMemberSourceDto,
      // #1. validate the DTO
      // done in mapper

      // #2. transform
      groupMember,
      parseActionData(
        CreateGroupMemberSourceMapper.fromGroupMemberToSource,
        this.logger,
        'RequestInvalidError'
      ),

      // #3. save
      TE.chain((groupMemberSourceForCreate) =>
        performAction(
          groupMemberSourceForCreate,
          sourceRepositories[source].create,
          this.errorFactory,
          this.logger,
          `save group member source`
        )
      )
    );

    return executeTask(task);
  }
}
