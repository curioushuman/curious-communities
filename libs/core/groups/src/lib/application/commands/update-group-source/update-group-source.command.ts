import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupSourceRepositoryReadWrite } from '../../../adapter/ports/group-source.repository';
import { GroupSource } from '../../../domain/entities/group-source';
import { UpdateGroupSourceDto } from './update-group-source.dto';
import { UpdateGroupSourceMapper } from './update-group-source.mapper';
import { GroupSourceRepositoryErrorFactory } from '../../../adapter/ports/group-source.repository.error-factory';

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
    private readonly groupSourceRepository: GroupSourceRepositoryReadWrite,
    private logger: LoggableLogger,
    private groupSourceErrorFactory: GroupSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(UpdateGroupSourceHandler.name);
  }

  async execute(command: UpdateGroupSourceCommand): Promise<GroupSource> {
    const { updateGroupSourceDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      updateGroupSourceDto,
      parseData(
        UpdateGroupSourceDto.check,
        this.logger,
        'InternalRequestInvalidError'
      )
    );

    const { group, groupSource } = validDto;

    const task = pipe(
      group,

      // #2. prepare the updated group source
      parseData(
        UpdateGroupSourceMapper.fromGroupToSource(groupSource),
        this.logger,
        'InternalRequestInvalidError'
      ),

      // #3. make sure an update is required
      parseData(
        UpdateGroupSourceMapper.requiresUpdate<GroupSource>(groupSource),
        this.logger,
        'SourceInvalidError'
      ),

      // #4. update the entity, from the source; if required
      O.fromNullable,
      O.fold(
        // if null, return the original group
        () => {
          this.logger.log(
            `GroupSource ${groupSource.id} does not need to be updated AT source`
          );
          return TE.right(groupSource);
        },
        // otherwise, update and return
        (ms) =>
          performAction(
            ms,
            this.groupSourceRepository.update,
            this.groupSourceErrorFactory,
            this.logger,
            `update source`
          )
      )
    );

    return executeTask(task);
  }
}
