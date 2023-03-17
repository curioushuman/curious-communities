import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';
import { findSourceIdAsValue } from '@curioushuman/common';

import { CoursesQueueService } from '../../adapter/ports/courses.queue-service';
import { UpdateCourseMultiRequestDto } from './dto/update-course-multi.request.dto';
import { Course } from '../../domain/entities/course';
import { FindCoursesMapper } from '../../application/queries/find-courses/find-courses.mapper';
import { FindCoursesQuery } from '../../application/queries/find-courses/find-courses.query';
import { UpdateCourseRequestDto } from '../update-course/dto/update-course.request.dto';
import config from '../../static/config';
import { ServiceError } from '@curioushuman/error-factory';

/**
 * Controller to handle updating multiple courses
 *
 * TODO:
 * - [ ] whole thing could be done in fp-ts
 */
@Controller()
export class UpdateCourseMultiController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus,
    private queueService: CoursesQueueService
  ) {
    this.logger.setContext(UpdateCourseMultiController.name);
  }

  private prepareUpdateDto(course: Course): UpdateCourseRequestDto {
    const idSourceValue = findSourceIdAsValue(
      course.sourceIds,
      course.sourceOrigin || config.defaults.primaryAccountSource
    );
    if (!idSourceValue) {
      throw new ServiceError(`Course missing relevant source (${course})`);
    }
    return {
      idSourceValue,
    };
  }

  private prepareMessages =
    (courses: Course[]) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_: UpdateCourseMultiRequestDto): UpdateCourseRequestDto[] => {
      return courses.map((course) => this.prepareUpdateDto(course));
    };

  public async update(requestDto: UpdateCourseMultiRequestDto): Promise<void> {
    // #1. validate dto
    const validDto = pipe(
      requestDto,
      parseData(UpdateCourseMultiRequestDto.check, this.logger)
    );

    // #2. find the courses
    const courses = await this.findCourses(validDto);

    const task = pipe(
      validDto,
      // #3. prepare the messages
      this.prepareMessages(courses),
      // #4. send the messages
      this.queueService.updateCourses
    );

    return executeTask(task);
  }

  private findCourses(
    validDto: UpdateCourseMultiRequestDto
  ): Promise<Course[]> {
    const task = pipe(
      validDto,

      // #1. transform dto
      parseActionData(
        FindCoursesMapper.fromUpdateCourseMultiRequestDto,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. call the query
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindCoursesQuery(findDto);
              return await this.queryBus.execute<FindCoursesQuery>(query);
            },
            (error: unknown) => error as Error
          )
        )
      )
    );

    return executeTask(task);
  }
}
