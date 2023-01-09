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

import {
  GroupSourceCommunityRepository,
  GroupSourceMicroCourseRepository,
  GroupSourceRepository,
} from '../../../adapter/ports/group-source.repository';
import { GroupSource } from '../../../domain/entities/group-source';
import { UpdateGroupSourceDto } from './update-group-source.dto';
import { UpdateGroupSourceMapper } from './update-group-source.mapper';

export class UpdateGroupSourceCommand implements ICommand {
  constructor(public readonly updateGroupSourceDto: UpdateGroupSourceDto) {}
}

/**
 * Command handler for update group source
 * TODO
 * - [ ] move the source repository selection to a separate service
 * - [ ] this shouldn't be accepting findDtos, doesn't feel right
 *       requires more thought. Look at upsert for example.
 */
@CommandHandler(UpdateGroupSourceCommand)
export class UpdateGroupSourceHandler
  implements ICommandHandler<UpdateGroupSourceCommand>
{
  constructor(
    private readonly groupSourceCommunityRepository: GroupSourceCommunityRepository,
    private readonly groupSourceMicroCourseRepository: GroupSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(UpdateGroupSourceHandler.name);
  }

  async execute(command: UpdateGroupSourceCommand): Promise<GroupSource> {
    const { updateGroupSourceDto } = command;

    // TODO don't do this here, extract it in the fp destructuring below
    const source = updateGroupSourceDto.source;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, GroupSourceRepository> = {
      COMMUNITY: this.groupSourceCommunityRepository,
      'MICRO-COURSE': this.groupSourceMicroCourseRepository,
    };

    const task = pipe(
      updateGroupSourceDto,
      // #1. validate the DTO
      parseActionData(
        UpdateGroupSourceDto.check,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. destructure the DTO
      // TODO improve/simplify
      TE.chain((dto) =>
        sequenceT(TE.ApplySeq)(TE.right(dto.group), TE.right(dto.groupSource))
      ),

      // #3. transform
      TE.chain(([group, groupSource]) =>
        pipe(
          group,
          parseActionData(
            UpdateGroupSourceMapper.fromGroupToSource(groupSource),
            this.logger,
            'SourceInvalidError'
          )
        )
      ),

      // #4. update the group source
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
