import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupMemberSourceRepositoryReadWrite } from '../../../adapter/ports/group-member-source.repository';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import {
  parseUpdateGroupMemberSourceDto,
  UpdateGroupMemberSourceDto,
} from './update-group-member-source.dto';
import { UpdateGroupMemberSourceMapper } from './update-group-member-source.mapper';
import { GroupMemberSourceRepositoryErrorFactory } from '../../../adapter/ports/group-member-source.repository.error-factory';

export class UpdateGroupMemberSourceCommand implements ICommand {
  constructor(
    public readonly updateGroupMemberSourceDto: UpdateGroupMemberSourceDto
  ) {}
}

/**
 * Command handler for update groupMember source
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
    private readonly groupMemberSourceRepository: GroupMemberSourceRepositoryReadWrite,
    private logger: LoggableLogger,
    private groupMemberSourceErrorFactory: GroupMemberSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(UpdateGroupMemberSourceHandler.name);
  }

  async execute(
    command: UpdateGroupMemberSourceCommand
  ): Promise<GroupMemberSource> {
    const { updateGroupMemberSourceDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      updateGroupMemberSourceDto,
      parseData(
        parseUpdateGroupMemberSourceDto,
        this.logger,
        'InternalRequestInvalidError'
      )
    );

    const { groupMember, groupMemberSource } = validDto;

    const task = pipe(
      groupMember,

      // #2. prepare the updated groupMember source
      parseData(
        UpdateGroupMemberSourceMapper.fromGroupMemberToSource(
          groupMemberSource
        ),
        this.logger,
        'InternalRequestInvalidError'
      ),

      // #3. make sure an update is required
      parseData(
        UpdateGroupMemberSourceMapper.requiresUpdate<GroupMemberSource>(
          groupMemberSource
        ),
        this.logger,
        'SourceInvalidError'
      ),

      // #4. update the entity, from the source; if required
      O.fromNullable,
      O.fold(
        // if null, return the original groupMember
        () => {
          this.logger.log(
            `GroupMemberSource ${groupMemberSource.id} does not need to be updated AT source`
          );
          return TE.right(groupMemberSource);
        },
        // otherwise, update and return
        (ms) =>
          performAction(
            ms,
            this.groupMemberSourceRepository.update,
            this.groupMemberSourceErrorFactory,
            this.logger,
            `update source`
          )
      )
    );

    return executeTask(task);
  }
}
