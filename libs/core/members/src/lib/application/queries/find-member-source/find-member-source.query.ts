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
  MemberSourceAuthRepository,
  MemberSourceCommunityRepository,
  MemberSourceCrmRepository,
  MemberSourceMicroCourseRepository,
  MemberSourceRepository,
} from '../../../adapter/ports/member-source.repository';
import { FindMemberSourceDto, parseDto } from './find-member-source.dto';
import { MemberSource } from '../../../domain/entities/member-source';
import config from '../../../static/config';

export class FindMemberSourceQuery implements IQuery {
  constructor(public readonly findMemberSourceDto: FindMemberSourceDto) {}
}

/**
 * Query handler for find member-source
 *
 * TODO
 * - [ ] must find a better way to handle the repository management
 */
@QueryHandler(FindMemberSourceQuery)
export class FindMemberSourceHandler
  implements IQueryHandler<FindMemberSourceQuery>
{
  constructor(
    private readonly memberSourceAuthRepository: MemberSourceAuthRepository,
    private readonly memberSourceCommunityRepository: MemberSourceCommunityRepository,
    private readonly memberSourceCrmRepository: MemberSourceCrmRepository,
    private readonly memberSourceMicroCourseRepository: MemberSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(FindMemberSourceHandler.name);
  }

  async execute(query: FindMemberSourceQuery): Promise<MemberSource> {
    const { findMemberSourceDto } = query;

    // * NOTE: currently idSource is the only identifier that is allowed
    // *       to define a specific source for query. Otherwise reverts
    // *       to the primary source.
    const source = findMemberSourceDto.value.source
      ? findMemberSourceDto.value.source
      : config.defaults.primaryAccountSource;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, MemberSourceRepository> = {
      AUTH: this.memberSourceAuthRepository,
      COMMUNITY: this.memberSourceCommunityRepository,
      CRM: this.memberSourceCrmRepository,
      'MICRO-COURSE': this.memberSourceMicroCourseRepository,
    };

    const task = pipe(
      findMemberSourceDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the memberSource
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          sourceRepositories[source].findOne(findMemberSourceDto.identifier),
          this.errorFactory,
          this.logger,
          `find memberSource: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
