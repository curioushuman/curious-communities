import { QueryHandler, IQueryHandler, IQuery } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { MemberRepository } from '../../../adapter/ports/member.repository';
import { FindMemberDto, parseDto } from './find-member.dto';
import { Member } from '../../../domain/entities/member';
import { MemberRepositoryErrorFactory } from '../../../adapter/ports/member.repository.error-factory';

export class FindMemberQuery implements IQuery {
  constructor(public readonly findMemberDto: FindMemberDto) {}
}

/**
 * Query handler for find member
 */
@QueryHandler(FindMemberQuery)
export class FindMemberHandler implements IQueryHandler<FindMemberQuery> {
  constructor(
    private readonly memberRepository: MemberRepository,
    private logger: LoggableLogger,
    private memberErrorFactory: MemberRepositoryErrorFactory
  ) {
    this.logger.setContext(FindMemberHandler.name);
  }

  async execute(query: FindMemberQuery): Promise<Member> {
    const { findMemberDto } = query;

    const task = pipe(
      findMemberDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the member
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.memberRepository.findOne(findMemberDto.identifier),
          this.memberErrorFactory,
          this.logger,
          `find member: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
