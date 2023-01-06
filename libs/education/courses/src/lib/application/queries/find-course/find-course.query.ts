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

import { CourseRepository } from '../../../adapter/ports/course.repository';
import { FindCourseDto, parseDto } from './find-course.dto';
import { Course } from '../../../domain/entities/course';

export class FindCourseQuery implements IQuery {
  constructor(public readonly findCourseDto: FindCourseDto) {}
}

/**
 * Query handler for find course
 */
@QueryHandler(FindCourseQuery)
export class FindCourseHandler implements IQueryHandler<FindCourseQuery> {
  constructor(
    private readonly courseRepository: CourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(FindCourseHandler.name);
  }

  async execute(query: FindCourseQuery): Promise<Course> {
    const { findCourseDto } = query;

    const task = pipe(
      findCourseDto,
      // #1. parse the dto
      // NOTE: this uses a dynamic parser that will parse the dto based on the
      //       identifier within the dto
      parseActionData(parseDto, this.logger, 'RequestInvalidError'),

      // #2. Find the course
      TE.chain((parsedDtOValue) =>
        performAction(
          parsedDtOValue,
          this.courseRepository.findOne(findCourseDto.identifier),
          this.errorFactory,
          this.logger,
          `find course: ${parsedDtOValue}`
        )
      )
    );

    return executeTask(task);
  }
}
