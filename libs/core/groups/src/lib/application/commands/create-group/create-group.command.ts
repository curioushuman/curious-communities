import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import {
  ErrorFactory,
  RepositoryItemConflictError,
  RepositoryItemNotFoundError,
} from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupRepository } from '../../../adapter/ports/group.repository';
import { CreateGroupDto } from './create-group.dto';
import { CreateGroupMapper } from './create-group.mapper';
import { GroupSourceRepository } from '../../../adapter/ports/group-source.repository';
import { GroupSource } from '../../../domain/entities/group-source';
import { GroupMapper } from '../../group.mapper';

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
    private readonly groupSourceRepository: GroupSourceRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateGroupHandler.name);
  }

  async execute(command: CreateGroupCommand): Promise<void> {
    const { createGroupDto } = command;

    const task = pipe(
      // #1. parse the dto
      // we want two DTOs 1. to find source, and 2. find group
      sequenceT(TE.ApplySeq)(
        parseActionData(
          CreateGroupMapper.toFindGroupSourceDto,
          this.logger,
          'RequestInvalidError'
        )(createGroupDto),
        parseActionData(
          CreateGroupMapper.toFindGroupDto,
          this.logger,
          'RequestInvalidError'
        )(createGroupDto)
      ),

      // #2. Find the source, and the group (to be updated)
      TE.chain(([findGroupSourceDto, findGroupDto]) =>
        sequenceT(TE.ApplySeq)(
          performAction(
            findGroupSourceDto,
            this.groupSourceRepository.findOne,
            this.errorFactory,
            this.logger,
            `find group source: ${findGroupSourceDto.id}`
          ),
          performAction(
            findGroupDto.value,
            this.groupRepository.checkById,
            this.errorFactory,
            this.logger,
            `check for existing group: ${findGroupDto.value}`
          )
        )
      ),

      // #3. validate + transform; groups exists, source is valid, source to group
      TE.chain(([groupSource, groupExists]) => {
        if (!groupSource) {
          throw new RepositoryItemNotFoundError(
            `Group source id: ${createGroupDto.id}`
          );
        }
        if (groupExists === true) {
          throw new RepositoryItemConflictError(
            `Group id: ${createGroupDto.id}`
          );
        }
        return pipe(
          groupSource,
          parseActionData(GroupSource.check, this.logger, 'SourceInvalidError'),
          TE.chain((groupSourceChecked) =>
            parseActionData(
              GroupMapper.fromSourceToGroup,
              this.logger,
              'SourceInvalidError'
            )(groupSourceChecked)
          )
        );
      }),

      // #5. update the group, from the source
      TE.chain((group) =>
        performAction(
          group,
          this.groupRepository.save,
          this.errorFactory,
          this.logger,
          `save group from source`
        )
      )
    );

    return executeTask(task);
  }
}
