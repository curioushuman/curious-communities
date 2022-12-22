import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import {
  ErrorFactory,
  RepositoryItemNotFoundError,
} from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupRepository } from '../../../adapter/ports/group.repository';
import { UpdateGroupDto } from './update-group.dto';
import { UpdateGroupMapper } from './update-group.mapper';
import { GroupSourceRepository } from '../../../adapter/ports/group-source.repository';
import { GroupSource } from '../../../domain/entities/group-source';
import { GroupMapper } from '../../group.mapper';

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
    private readonly groupSourceRepository: GroupSourceRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(UpdateGroupHandler.name);
  }

  async execute(command: UpdateGroupCommand): Promise<void> {
    const { updateGroupDto } = command;

    const task = pipe(
      // #1. parse the dto
      // we want two DTOs 1. to find source, and 2. find group
      sequenceT(TE.ApplySeq)(
        parseActionData(
          UpdateGroupMapper.toFindGroupSourceDto,
          this.logger,
          'RequestInvalidError'
        )(updateGroupDto),
        parseActionData(
          UpdateGroupMapper.toFindGroupDto,
          this.logger,
          'RequestInvalidError'
        )(updateGroupDto)
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
            `find group: ${findGroupDto.value}`
          )
        )
      ),

      // #3. validate + transform; groups exists, source is valid, source to group
      TE.chain(([groupSource, groupExists]) => {
        if (!groupSource) {
          throw new RepositoryItemNotFoundError(
            `Group source id: ${updateGroupDto.id}`
          );
        }
        if (groupExists === false) {
          throw new RepositoryItemNotFoundError(
            `Group id: ${updateGroupDto.id}`
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
