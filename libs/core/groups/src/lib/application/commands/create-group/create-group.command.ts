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

import { GroupRepository } from '../../../adapter/ports/group.repository';
import { CreateGroupDto } from './create-group.dto';
import { GroupBase } from '../../../domain/entities/group';
import { GroupRepositoryErrorFactory } from '../../../adapter/ports/group.repository.error-factory';
import { CreateGroupMapper } from './create-group.mapper';

export class CreateGroupCommand implements ICommand {
  constructor(public readonly createGroupDto: CreateGroupDto) {}
}

/**
 * Command handler for create group
 * TODO
 * - [ ] better associated group check
 *       e.g. check against local IDs rather than just existence of groupId
 */
@CommandHandler(CreateGroupCommand)
export class CreateGroupHandler implements ICommandHandler<CreateGroupCommand> {
  constructor(
    private readonly groupRepository: GroupRepository,
    private logger: LoggableLogger,
    private groupErrorFactory: GroupRepositoryErrorFactory
  ) {
    this.logger.setContext(CreateGroupHandler.name);
  }

  async execute(command: CreateGroupCommand): Promise<GroupBase> {
    const { createGroupDto } = command;

    const task = pipe(
      createGroupDto,
      // #1. validate the dto
      parseData(CreateGroupDto.check, this.logger, 'SourceInvalidError'),
      // #2. transform the dto into a group
      parseActionData(
        CreateGroupMapper.fromDto,
        this.logger,
        'SourceInvalidError'
      ),
      // #3. save the group
      TE.chain((group) =>
        performAction(
          group,
          this.groupRepository.save,
          this.groupErrorFactory,
          this.logger,
          `save group`
        )
      )
    );

    return executeTask(task);
  }
}
