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

import { CourseGroupRepository } from '../../../adapter/ports/course-group.repository';
import { FindCourseGroupDto, parseDto } from './find-course-group.dto';
import { CourseGroup } from '../../../domain/entities/course-group';

export class FindCourseGroupQuery implements IQuery {
  constructor(public readonly findGroupDto: FindCourseGroupDto) {}
}

/**
 * Query handler for find courseGroup
 */
@QueryHandler(FindCourseGroupQuery)
export class FindCourseGroupHandler
  implements IQueryHandler<FindCourseGroupQuery>
{
  constructor(
    private readonly courseGroupRepository: CourseGroupRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(FindCourseGroupHandler.name);
  }

  async execute(query: FindCourseGroupQuery): Promise<CourseGroup> {
    const { findGroupDto } = query;

    const task = pipe(
      findGroupDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the courseGroup
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.courseGroupRepository.findOne(findGroupDto.identifier),
          this.errorFactory,
          this.logger,
          `find courseGroup: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
