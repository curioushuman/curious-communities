import { QueryHandler, IQueryHandler, IQuery } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CourseRepository } from '../../../adapter/ports/course.repository';
import { FindCoursesDto } from './find-courses.dto';
import { CourseBase } from '../../../domain/entities/course';
import { CourseRepositoryErrorFactory } from '../../../adapter/ports/course.repository.error-factory';

export class FindCoursesQuery implements IQuery {
  constructor(public readonly findCoursesDto: FindCoursesDto) {}
}

/**
 * Query handler for find course
 */
@QueryHandler(FindCoursesQuery)
export class FindCoursesHandler implements IQueryHandler<FindCoursesQuery> {
  constructor(
    private readonly courseRepository: CourseRepository,
    private logger: LoggableLogger,
    private courseErrorFactory: CourseRepositoryErrorFactory
  ) {
    this.logger.setContext(FindCoursesHandler.name);
  }

  async execute(query: FindCoursesQuery): Promise<CourseBase[]> {
    const { findCoursesDto } = query;

    const task = pipe(
      findCoursesDto,
      parseActionData(
        FindCoursesDto.check,
        this.logger,
        'InternalRequestInvalidError'
      ),

      // #2. Find the course
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.courseRepository.findAll,
          this.courseErrorFactory,
          this.logger,
          `find course: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
