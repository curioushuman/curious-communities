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

import { GroupRepository } from '../../../adapter/ports/group.repository';
import { FindGroupDto, parseDto } from './find-group.dto';
import { Group } from '../../../domain/entities/group';

export class FindGroupQuery implements IQuery {
  constructor(public readonly findGroupDto: FindGroupDto) {}
}

/**
 * Query handler for find group
 */
@QueryHandler(FindGroupQuery)
export class FindGroupHandler implements IQueryHandler<FindGroupQuery> {
  constructor(
    private readonly groupRepository: GroupRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(FindGroupHandler.name);
  }

  async execute(query: FindGroupQuery): Promise<Group> {
    const { findGroupDto } = query;

    const task = pipe(
      findGroupDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the group
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.groupRepository.findOne(findGroupDto.identifier),
          this.errorFactory,
          this.logger,
          `find group: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
