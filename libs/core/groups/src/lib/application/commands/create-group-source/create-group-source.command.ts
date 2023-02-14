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

import { GroupSourceRepositoryReadWrite } from '../../../adapter/ports/group-source.repository';
import { GroupSource } from '../../../domain/entities/group-source';
import { CreateGroupSourceDto } from './create-group-source.dto';
import { CreateGroupSourceMapper } from './create-group-source.mapper';
import { GroupSourceRepositoryErrorFactory } from '../../../adapter/ports/group-source.repository.error-factory';

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
    private readonly groupSourceRepository: GroupSourceRepositoryReadWrite,
    private logger: LoggableLogger,
    private groupRepositoryErrorFactory: GroupSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(CreateGroupSourceHandler.name);
  }

  async execute(command: CreateGroupSourceCommand): Promise<GroupSource> {
    const { createGroupSourceDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      createGroupSourceDto,
      parseData(
        CreateGroupSourceDto.check,
        this.logger,
        'InternalRequestInvalidError'
      )
    );

    const { group } = validDto;

    const task = pipe(
      group,
      // #2. populate group source
      parseActionData(
        CreateGroupSourceMapper.fromGroupToSource,
        this.logger,
        'InternalRequestInvalidError'
      ),

      // #3. create the group source
      TE.chain((groupSourceForCreate) =>
        performAction(
          groupSourceForCreate,
          this.groupSourceRepository.create,
          this.groupRepositoryErrorFactory,
          this.logger,
          `save group source`
        )
      )
    );

    return executeTask(task);
  }
}
