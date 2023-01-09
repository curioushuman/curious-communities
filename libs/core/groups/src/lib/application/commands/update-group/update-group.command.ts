import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import { ErrorFactory } from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupRepository } from '../../../adapter/ports/group.repository';
import { UpdateGroupDto } from './update-group.dto';
import { UpdateGroupMapper } from './update-group.mapper';
import {
  GroupSourceCommunityRepository,
  GroupSourceMicroCourseRepository,
  GroupSourceRepository,
} from '../../../adapter/ports/group-source.repository';
import { GroupSource } from '../../../domain/entities/group-source';
import { Group } from '../../../domain/entities/group';
import config from '../../../static/config';
import { parseDto as parseGroupSourceDto } from '../../queries/find-group-source/find-group-source.dto';

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
    private readonly groupSourceCommunityRepository: GroupSourceCommunityRepository,
    private readonly groupSourceMicroCourseRepository: GroupSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(UpdateGroupHandler.name);
  }

  async execute(command: UpdateGroupCommand): Promise<Group> {
    const { updateGroupDto } = command;

    // * NOTE: currently idSource is the only identifier that is allowed
    // *       to define a specific source for query. Otherwise reverts
    // *       to the primary source.
    const source = updateGroupDto.source
      ? updateGroupDto.source
      : config.defaults.primaryAccountSource;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, GroupSourceRepository> = {
      COMMUNITY: this.groupSourceCommunityRepository,
      'MICRO-COURSE': this.groupSourceMicroCourseRepository,
    };

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
            // ! this is a bit not-normal
            // this is the only place we do parseGroupSourceDto here
            // TODO: make this more consistent with the rest
            parseGroupSourceDto(findGroupSourceDto),
            sourceRepositories[source].findOne(findGroupSourceDto.identifier),
            this.errorFactory,
            this.logger,
            `find group source: ${findGroupSourceDto.value}`
          ),
          performAction(
            findGroupDto.value,
            this.groupRepository.findOne(findGroupDto.identifier),
            this.errorFactory,
            this.logger,
            `find group: ${findGroupDto.value}`
          )
        )
      ),

      // #3. validate + transform; groups exists, source is valid, source to group
      TE.chain(([groupSource, existingGroup]) =>
        pipe(
          groupSource,
          parseActionData(GroupSource.check, this.logger, 'SourceInvalidError'),
          TE.chain((groupSourceChecked) =>
            parseActionData(
              UpdateGroupMapper.fromSourceToGroup(existingGroup),
              this.logger,
              'SourceInvalidError'
            )(groupSourceChecked)
          )
        )
      ),

      // #4. update the group, from the source
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
