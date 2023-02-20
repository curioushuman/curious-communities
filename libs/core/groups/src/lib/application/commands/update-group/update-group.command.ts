import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupRepository } from '../../../adapter/ports/group.repository';
import { GroupBase } from '../../../domain/entities/group';
import { GroupRepositoryErrorFactory } from '../../../adapter/ports/group.repository.error-factory';
import { UpdateGroupDto } from './update-group.dto';
import { UpdateGroupMapper } from './update-group.mapper';
import { RepositoryItemUpdateError } from '@curioushuman/error-factory';

export class UpdateGroupCommand implements ICommand {
  constructor(public readonly updateGroupDto: UpdateGroupDto) {}
}

/**
 * Command handler for update group
 * TODO
 * - [ ] better associated group check
 *       e.g. check against local IDs rather than just existence of groupId
 */
@CommandHandler(UpdateGroupCommand)
export class UpdateGroupHandler implements ICommandHandler<UpdateGroupCommand> {
  constructor(
    private readonly groupRepository: GroupRepository,
    private logger: LoggableLogger,
    private groupErrorFactory: GroupRepositoryErrorFactory
  ) {
    this.logger.setContext(UpdateGroupHandler.name);
  }

  async execute(command: UpdateGroupCommand): Promise<GroupBase> {
    const { updateGroupDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      updateGroupDto,
      parseData(UpdateGroupDto.check, this.logger, 'SourceInvalidError')
    );

    const { group } = validDto;

    // #2 validate/parse the groupMember from the DTO
    const parsedGroup = this.parseDto(validDto);

    const task = pipe(
      parsedGroup,

      // #4. update the entity, from the source; if required
      O.fromNullable,
      O.fold(
        // if null, return the original group
        () => {
          const msg = `Group ${group.id} does not need to be updated from source`;
          // as we catch this error above, it is no longer logged
          // so let's log it manually for a complete audit trail
          this.logger.error(msg);
          throw new RepositoryItemUpdateError(msg);
        },
        // otherwise, update and return
        (g) =>
          performAction(
            g,
            this.groupRepository.save,
            this.groupErrorFactory,
            this.logger,
            `save group`
          )
      )
    );

    return executeTask(task);
  }

  parseDto(validDto: UpdateGroupDto): GroupBase | undefined {
    const { group, course, groupSource } = validDto;
    // if no participant or groupSource it means we're doing a straight update
    // so we skip the requiresUpdate check
    if (!course && !groupSource) {
      return group;
    }
    return pipe(
      validDto,
      // #4. update the entity, from the course/source
      parseData(
        UpdateGroupMapper.fromDto,
        this.logger,
        'InternalRequestInvalidError'
      ),
      // #3. make sure an update is required
      parseData(
        UpdateGroupMapper.requiresUpdate<GroupBase>(group),
        this.logger,
        'InternalRequestInvalidError'
      )
    );
  }
}
