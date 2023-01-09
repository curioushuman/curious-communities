import { QueryHandler, IQueryHandler, IQuery } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

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
import { FindGroupSourceDto, parseDto } from './find-group-source.dto';
import { GroupSource } from '../../../domain/entities/group-source';
import config from '../../../static/config';

export class FindGroupSourceQuery implements IQuery {
  constructor(public readonly findGroupSourceDto: FindGroupSourceDto) {}
}

/**
 * Query handler for find group-source
 *
 * TODO
 * - [ ] must find a better way to handle the repository management
 */
@QueryHandler(FindGroupSourceQuery)
export class FindGroupSourceHandler
  implements IQueryHandler<FindGroupSourceQuery>
{
  constructor(
    private readonly groupSourceCommunityRepository: GroupSourceCommunityRepository,
    private readonly groupSourceMicroCourseRepository: GroupSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(FindGroupSourceHandler.name);
  }

  async execute(query: FindGroupSourceQuery): Promise<GroupSource> {
    const { findGroupSourceDto } = query;

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
      findGroupSourceDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the groupSource
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          sourceRepositories[source].findOne(findGroupSourceDto.identifier),
          this.errorFactory,
          this.logger,
          `find groupSource: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
