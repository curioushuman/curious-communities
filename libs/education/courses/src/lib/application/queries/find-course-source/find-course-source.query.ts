import { QueryHandler, IQueryHandler, IQuery } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CourseSourceRepository } from '../../../adapter/ports/course-source.repository';
import { FindCourseSourceDto, parseDto } from './find-course-source.dto';
import { CourseSource } from '../../../domain/entities/course-source';
import { CourseSourceRepositoryErrorFactory } from '../../../adapter/ports/course-source.repository.error-factory';

export class FindCourseSourceQuery implements IQuery {
  constructor(public readonly findCourseSourceDto: FindCourseSourceDto) {}
}

/**
 * Query handler for find course
 */
@QueryHandler(FindCourseSourceQuery)
export class FindCourseSourceHandler
  implements IQueryHandler<FindCourseSourceQuery>
{
  constructor(
    private readonly courseSourceRepository: CourseSourceRepository,
    private logger: LoggableLogger,
    private courseSourceErrorFactory: CourseSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(FindCourseSourceHandler.name);
  }

  async execute(query: FindCourseSourceQuery): Promise<CourseSource> {
    const { findCourseSourceDto } = query;

    const task = pipe(
      findCourseSourceDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      // * Hence why this is one of the only places (remaining)
      // * where validation wasn't handled in the mapper
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the course
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.courseSourceRepository.findOne(findCourseSourceDto.identifier),
          this.courseSourceErrorFactory,
          this.logger,
          `find course: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
