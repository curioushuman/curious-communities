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

import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';
import { FindGroupMemberDto, parseDto } from './find-group-member.dto';
import { GroupMember } from '../../../domain/entities/group-member';

export class FindGroupMemberQuery implements IQuery {
  constructor(public readonly findGroupMemberDto: FindGroupMemberDto) {}
}

/**
 * Query handler for find group
 */
@QueryHandler(FindGroupMemberQuery)
export class FindGroupMemberHandler
  implements IQueryHandler<FindGroupMemberQuery>
{
  constructor(
    private readonly groupRepository: GroupMemberRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(FindGroupMemberHandler.name);
  }

  async execute(query: FindGroupMemberQuery): Promise<GroupMember> {
    const { findGroupMemberDto } = query;

    const task = pipe(
      findGroupMemberDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the group
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.groupRepository.findOne(findGroupMemberDto.identifier),
          this.errorFactory,
          this.logger,
          `find group: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
