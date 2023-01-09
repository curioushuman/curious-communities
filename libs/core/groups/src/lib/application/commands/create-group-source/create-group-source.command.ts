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
import { CreateGroupSourceDto } from './create-group-source.dto';
import { CreateGroupSourceMapper } from './create-group-source.mapper';

export class CreateGroupSourceCommand implements ICommand {
  constructor(public readonly createGroupSourceDto: CreateGroupSourceDto) {}
}

/**
 * Command handler for create group source
 * TODO
 * - [ ] move the source repository selection to a separate service
 * - [ ] this shouldn't be accepting findDtos, doesn't feel right
 *       requires more thought. Look at upsert for example.
 */
@CommandHandler(CreateGroupSourceCommand)
export class CreateGroupSourceHandler
  implements ICommandHandler<CreateGroupSourceCommand>
{
  constructor(
    private readonly groupSourceCommunityRepository: GroupSourceCommunityRepository,
    private readonly groupSourceMicroCourseRepository: GroupSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateGroupSourceHandler.name);
  }

  async execute(command: CreateGroupSourceCommand): Promise<GroupSource> {
    const { createGroupSourceDto } = command;

    // TODO don't do this here, extract it in the fp destructuring below
    const source = createGroupSourceDto.source;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, GroupSourceRepository> = {
      COMMUNITY: this.groupSourceCommunityRepository,
      'MICRO-COURSE': this.groupSourceMicroCourseRepository,
    };

    const task = pipe(
      createGroupSourceDto,
      // #1. validate the DTO
      parseActionData(
        CreateGroupSourceDto.check,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. destructure the DTO
      // TODO improve/simplify
      TE.chain((dto) => sequenceT(TE.ApplySeq)(TE.right(dto.group))),

      // #3. transform
      TE.chain(([group]) =>
        pipe(
          group,
          parseActionData(
            CreateGroupSourceMapper.fromGroupToSource,
            this.logger,
            'RequestInvalidError'
          )
        )
      ),

      // #4. create the group source
      TE.chain((groupSourceForCreate) =>
        performAction(
          groupSourceForCreate,
          sourceRepositories[source].create,
          this.errorFactory,
          this.logger,
          `save group source`
        )
      )
    );

    return executeTask(task);
  }
}
