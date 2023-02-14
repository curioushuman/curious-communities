import { QueryHandler, IQueryHandler, IQuery } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupSourceRepositoryRead } from '../../../adapter/ports/group-source.repository';
import { FindGroupSourceDto, parseDto } from './find-group-source.dto';
import { GroupSource } from '../../../domain/entities/group-source';
import { GroupSourceRepositoryErrorFactory } from '../../../adapter/ports/group-source.repository.error-factory';

export class FindGroupSourceQuery implements IQuery {
  constructor(public readonly findGroupSourceDto: FindGroupSourceDto) {}
}

/**
 * Query handler for find group
 */
@QueryHandler(FindGroupSourceQuery)
export class FindGroupSourceHandler
  implements IQueryHandler<FindGroupSourceQuery>
{
  constructor(
    private readonly groupSourceRepository: GroupSourceRepositoryRead,
    private logger: LoggableLogger,
    private groupSourceErrorFactory: GroupSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(FindGroupSourceHandler.name);
  }

  async execute(query: FindGroupSourceQuery): Promise<GroupSource> {
    const { findGroupSourceDto } = query;

    const task = pipe(
      findGroupSourceDto,
      // #1. parse the dto
      parseActionData(parseDto, this.logger, 'InternalRequestInvalidError'),

      // #2. Find the group
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.groupSourceRepository.findOne(findGroupSourceDto.identifier),
          this.groupSourceErrorFactory,
          this.logger,
          `find group: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
