import { QueryHandler, IQueryHandler, IQuery } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { MemberSourceRepositoryReadWrite } from '../../../adapter/ports/member-source.repository';
import { FindMemberSourceDto, parseDto } from './find-member-source.dto';
import { MemberSource } from '../../../domain/entities/member-source';
import { MemberSourceRepositoryErrorFactory } from '../../../adapter/ports/member-source.repository.error-factory';

export class FindMemberSourceQuery implements IQuery {
  constructor(public readonly findMemberSourceDto: FindMemberSourceDto) {}
}

/**
 * Query handler for find member-source
 */
@QueryHandler(FindMemberSourceQuery)
export class FindMemberSourceHandler
  implements IQueryHandler<FindMemberSourceQuery>
{
  constructor(
    private readonly memberSourceRepository: MemberSourceRepositoryReadWrite,
    private logger: LoggableLogger,
    private memberSourceErrorFactory: MemberSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(FindMemberSourceHandler.name);
  }

  async execute(query: FindMemberSourceQuery): Promise<MemberSource> {
    const { findMemberSourceDto } = query;

    const task = pipe(
      findMemberSourceDto,
      // #1. parse the
      // NOTE: this uses a dynamic parser that will parse the dto based on thedto
      //       identifier within the dto
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the memberSource
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.memberSourceRepository.findOne(findMemberSourceDto.identifier),
          this.memberSourceErrorFactory,
          this.logger,
          `find memberSource: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
