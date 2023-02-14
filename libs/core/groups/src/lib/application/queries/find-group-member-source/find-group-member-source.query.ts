import { QueryHandler, IQueryHandler, IQuery } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupMemberSourceRepositoryRead } from '../../../adapter/ports/group-member-source.repository';
import {
  FindGroupMemberSourceDto,
  parseDto,
} from './find-group-member-source.dto';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { GroupMemberSourceRepositoryErrorFactory } from '../../../adapter/ports/group-member-source.repository.error-factory';

export class FindGroupMemberSourceQuery implements IQuery {
  constructor(
    public readonly findGroupMemberSourceDto: FindGroupMemberSourceDto
  ) {}
}

/**
 * Query handler for find groupMember
 */
@QueryHandler(FindGroupMemberSourceQuery)
export class FindGroupMemberSourceHandler
  implements IQueryHandler<FindGroupMemberSourceQuery>
{
  constructor(
    private readonly groupMemberSourceRepository: GroupMemberSourceRepositoryRead,
    private logger: LoggableLogger,
    private groupMemberSourceErrorFactory: GroupMemberSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(FindGroupMemberSourceHandler.name);
  }

  async execute(query: FindGroupMemberSourceQuery): Promise<GroupMemberSource> {
    const { findGroupMemberSourceDto } = query;

    const task = pipe(
      findGroupMemberSourceDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(parseDto, this.logger, 'InternalRequestInvalidError'),

      // #2. Find the groupMember
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.groupMemberSourceRepository.findOne(
            findGroupMemberSourceDto.identifier
          ),
          this.groupMemberSourceErrorFactory,
          this.logger,
          `find groupMember: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
