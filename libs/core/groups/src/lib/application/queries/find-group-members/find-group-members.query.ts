import { QueryHandler, IQueryHandler, IQuery } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';
import { FindGroupMembersDto } from './find-group-members.dto';
import { GroupMember } from '../../../domain/entities/group-member';
import { GroupMemberRepositoryErrorFactory } from '../../../adapter/ports/group-member.repository.error-factory';

export class FindGroupMembersQuery implements IQuery {
  constructor(public readonly findGroupMemberDto: FindGroupMembersDto) {}
}

/**
 * Query handler for find groupMember
 */
@QueryHandler(FindGroupMembersQuery)
export class FindGroupMembersHandler
  implements IQueryHandler<FindGroupMembersQuery>
{
  constructor(
    private readonly groupMemberRepository: GroupMemberRepository,
    private logger: LoggableLogger,
    private groupMemberErrorFactory: GroupMemberRepositoryErrorFactory
  ) {
    this.logger.setContext(FindGroupMembersHandler.name);
  }

  async execute(query: FindGroupMembersQuery): Promise<GroupMember[]> {
    const { findGroupMemberDto } = query;

    const task = pipe(
      findGroupMemberDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(
        FindGroupMembersDto.check,
        this.logger,
        'InternalRequestInvalidError'
      ),

      // #2. Find the groupMember
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.groupMemberRepository.findAll,
          this.groupMemberErrorFactory,
          this.logger,
          `find groupMember: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
