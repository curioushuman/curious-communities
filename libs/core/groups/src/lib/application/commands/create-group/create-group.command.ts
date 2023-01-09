import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import {
  ErrorFactory,
  RepositoryItemConflictError,
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
import {
  GroupSourceCommunityRepository,
  GroupSourceMicroCourseRepository,
  GroupSourceRepository,
} from '../../../adapter/ports/group-source.repository';
import { GroupSource } from '../../../domain/entities/group-source';
import { Group } from '../../../domain/entities/group';
import config from '../../../static/config';
import { parseDto as parseGroupDto } from '../../queries/find-group/find-group.dto';
import { parseDto as parseGroupSourceDto } from '../../queries/find-group-source/find-group-source.dto';

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
    private readonly groupSourceCommunityRepository: GroupSourceCommunityRepository,
    private readonly groupSourceMicroCourseRepository: GroupSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateGroupHandler.name);
  }

  async execute(command: CreateGroupCommand): Promise<Group> {
    const {
      createGroupDto: { findGroupDto, findGroupSourceDto },
    } = command;

    // * NOTE: currently idSource is the only identifier that is allowed
    // *       to define a specific source for query. Otherwise reverts
    // *       to the primary source.
    const source = findGroupSourceDto.value.source
      ? findGroupSourceDto.value.source
      : config.defaults.primaryAccountSource;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, GroupSourceRepository> = {
      COMMUNITY: this.groupSourceCommunityRepository,
      'MICRO-COURSE': this.groupSourceMicroCourseRepository,
    };

    const task = pipe(
      // #1. parse the dto and extract the values
      sequenceT(TE.ApplySeq)(
        parseActionData(
          parseGroupSourceDto,
          this.logger,
          'RequestInvalidError'
        )(findGroupSourceDto),
        parseActionData(
          parseGroupDto,
          this.logger,
          'RequestInvalidError'
        )(findGroupDto)
      ),

      // #2. Find the source, and the group (to be updated)
      TE.chain(([parsedGroupSourceDtoValue, parsedGroupDtoValue]) =>
        sequenceT(TE.ApplySeq)(
          performAction(
            parsedGroupSourceDtoValue,
            sourceRepositories[source].findOne(findGroupSourceDto.identifier),
            this.errorFactory,
            this.logger,
            `find group source: ${findGroupSourceDto.value}`
          ),
          performAction(
            parsedGroupDtoValue,
            this.groupRepository.check(findGroupDto.identifier),
            this.errorFactory,
            this.logger,
            `check for existing group: ${findGroupDto.value}`
          )
        )
      ),

      // #3. validate + transform; groups exists, source is valid, source to group
      TE.chain(([groupSource, groupExists]) => {
        if (groupExists === true) {
          throw new RepositoryItemConflictError(`Group: ${findGroupDto.value}`);
        }

        return pipe(
          groupSource,
          parseActionData(GroupSource.check, this.logger, 'SourceInvalidError'),
          TE.chain((groupSourceChecked) =>
            parseActionData(
              CreateGroupMapper.fromSourceToGroup,
              this.logger,
              'SourceInvalidError'
            )(groupSourceChecked)
          )
        );
      }),

      // #5. create the group, from the source
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
