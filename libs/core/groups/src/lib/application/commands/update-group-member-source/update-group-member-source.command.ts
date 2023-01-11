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
import { UpdateGroupMemberSourceDto } from './update-group-member-source.dto';
import { UpdateGroupMemberSourceMapper } from './update-group-member-source.mapper';

export class UpdateGroupMemberSourceCommand implements ICommand {
  constructor(
    public readonly updateGroupMemberSourceDto: UpdateGroupMemberSourceDto
  ) {}
}

/**
 * Command handler for update group source
 * TODO
 * - [ ] move the source repository selection to a separate service
 * - [ ] this shouldn't be accepting findDtos, doesn't feel right
 *       requires more thought. Look at upsert for example.
 */
@CommandHandler(UpdateGroupMemberSourceCommand)
export class UpdateGroupMemberSourceHandler
  implements ICommandHandler<UpdateGroupMemberSourceCommand>
{
  constructor(
    private readonly groupSourceCommunityRepository: GroupMemberSourceCommunityRepository,
    private readonly groupSourceMicroCourseRepository: GroupMemberSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(UpdateGroupMemberSourceHandler.name);
  }

  async execute(
    command: UpdateGroupMemberSourceCommand
  ): Promise<GroupMemberSource> {
    const { updateGroupMemberSourceDto } = command;

    // we can safely destructure as the DTO has been validated in mapper
    const { source, groupMember, groupMemberSource } =
      updateGroupMemberSourceDto;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, GroupMemberSourceRepository> = {
      COMMUNITY: this.groupSourceCommunityRepository,
      'MICRO-COURSE': this.groupSourceMicroCourseRepository,
    };

    const task = pipe(
      // updateGroupMemberSourceDto,
      // #1. validate the DTO
      // done in mapper

      // #2. transform
      groupMember,
      parseActionData(
        UpdateGroupMemberSourceMapper.fromGroupMemberToSource(
          groupMemberSource
        ),
        this.logger,
        'RequestInvalidError'
      ),

      // #3. save
      TE.chain((ms) =>
        performAction(
          ms,
          sourceRepositories[source].update,
          this.errorFactory,
          this.logger,
          `update group source`
        )
      )
    );

    return executeTask(task);
  }
}
