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
  GroupMemberSourceCommunityRepository,
  GroupMemberSourceMicroCourseRepository,
  GroupMemberSourceRepository,
} from '../../../adapter/ports/group-member-source.repository';
import {
  FindGroupMemberSourceDto,
  parseDto,
} from './find-group-member-source.dto';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import config from '../../../static/config';

export class FindGroupMemberSourceQuery implements IQuery {
  constructor(
    public readonly findGroupMemberSourceDto: FindGroupMemberSourceDto
  ) {}
}

/**
 * Query handler for find group-source
 *
 * TODO
 * - [ ] must find a better way to handle the repository management
 */
@QueryHandler(FindGroupMemberSourceQuery)
export class FindGroupMemberSourceHandler
  implements IQueryHandler<FindGroupMemberSourceQuery>
{
  constructor(
    private readonly groupMemberSourceCommunityRepository: GroupMemberSourceCommunityRepository,
    private readonly groupMemberSourceMicroCourseRepository: GroupMemberSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(FindGroupMemberSourceHandler.name);
  }

  async execute(query: FindGroupMemberSourceQuery): Promise<GroupMemberSource> {
    const { findGroupMemberSourceDto } = query;

    // NOTE: Source has been validated in the mapper
    const source = findGroupMemberSourceDto.source
      ? findGroupMemberSourceDto.source
      : config.defaults.primaryAccountSource;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, GroupMemberSourceRepository> = {
      COMMUNITY: this.groupMemberSourceCommunityRepository,
      'MICRO-COURSE': this.groupMemberSourceMicroCourseRepository,
    };

    const task = pipe(
      findGroupMemberSourceDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      // * Hence why this is one of the only places (remaining)
      // * where validation wasn't handled in the mapper
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the groupMemberSource
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          sourceRepositories[source].findOne(
            findGroupMemberSourceDto.identifier
          ),
          this.errorFactory,
          this.logger,
          `find groupMemberSource: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
