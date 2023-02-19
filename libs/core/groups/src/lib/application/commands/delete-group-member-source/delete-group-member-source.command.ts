import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupMemberSourceRepositoryReadWrite } from '../../../adapter/ports/group-member-source.repository';
import { DeleteGroupMemberSourceDto } from './delete-group-member-source.dto';
import { GroupMemberSourceRepositoryErrorFactory } from '../../../adapter/ports/group-member-source.repository.error-factory';

export class DeleteGroupMemberSourceCommand implements ICommand {
  constructor(
    public readonly updateGroupMemberSourceDto: DeleteGroupMemberSourceDto
  ) {}
}

/**
 * Command handler for update groupMember source
 * TODO
 * - [ ] move the source repository selection to a separate service
 * - [ ] this shouldn't be accepting findDtos, doesn't feel right
 *       requires more thought. Look at upsert for example.
 */
@CommandHandler(DeleteGroupMemberSourceCommand)
export class DeleteGroupMemberSourceHandler
  implements ICommandHandler<DeleteGroupMemberSourceCommand>
{
  constructor(
    private readonly groupMemberSourceRepository: GroupMemberSourceRepositoryReadWrite,
    private logger: LoggableLogger,
    private groupMemberSourceErrorFactory: GroupMemberSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(DeleteGroupMemberSourceHandler.name);
  }

  async execute(command: DeleteGroupMemberSourceCommand): Promise<void> {
    const { updateGroupMemberSourceDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      updateGroupMemberSourceDto,
      parseData(
        DeleteGroupMemberSourceDto.check,
        this.logger,
        'InternalRequestInvalidError'
      )
    );

    const { groupMemberSource } = validDto;

    const task = performAction(
      groupMemberSource,
      this.groupMemberSourceRepository.delete,
      this.groupMemberSourceErrorFactory,
      this.logger,
      `update source`
    );

    return executeTask(task);
  }
}
