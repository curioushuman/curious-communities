import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryItemUpdateError } from '@curioushuman/error-factory';
import { RequestSourceEnum } from '@curioushuman/common';

import { UpdateCourseRequestDto } from './dto/update-course.request.dto';
import { UpdateCourseCommand } from '../../application/commands/update-course/update-course.command';
import { CourseMapper } from '../course.mapper';
import { CourseSource } from '../../domain/entities/course-source';
import { FindCourseMapper } from '../../application/queries/find-course/find-course.mapper';
import { FindCourseQuery } from '../../application/queries/find-course/find-course.query';
import { Course } from '../../domain/entities/course';
import { UpdateCourseDto } from '../../application/commands/update-course/update-course.dto';
import { FindCourseSourceMapper } from '../../application/queries/find-course-source/find-course-source.mapper';
import { FindCourseSourceQuery } from '../../application/queries/find-course-source/find-course-source.query';
import {
  prepareUpsertResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';

/**
 * Controller for update course operations
 */

@Controller()
export class UpdateCourseController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpdateCourseController.name);
  }

  /**
   * Public method to update a course
   *
   * TODO:
   * - [ ] whole thing could be done in fp-ts
   */
  public async update(
    requestDto: UpdateCourseRequestDto
  ): Promise<ResponsePayload<'course-base'>> {
    // log the dto
    this.logger.debug(requestDto, 'update');

    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(UpdateCourseRequestDto.check, this.logger)
    );

    // here we determine which route to take
    // update via source or update via course
    const courseDto = validDto.course;
    let course: Course;
    let courseSource: CourseSource | undefined = undefined;
    if (courseDto) {
      course = pipe(
        courseDto,
        parseData(CourseMapper.fromResponseDto, this.logger)
      );
      if (validDto.requestSource !== RequestSourceEnum.INTERNAL) {
        // this is purely a check, we're not going to use the value
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const courseExists = await this.findCourseById(validDto);
      }
    } else {
      [course, courseSource] = await Promise.all([
        this.findCourse(validDto),
        this.findCourseSource(validDto),
      ]);
    }

    // ? should the comparison of source to course be done here?

    // set up the command dto
    const updateDto = {
      course,
      courseSource,
    } as UpdateCourseDto;

    // #3. execute the command
    const updatedCourse = await this.updateCourse(updateDto);

    // #4. return the response
    let payload = pipe(
      course,
      parseData(CourseMapper.toBaseResponseDto, this.logger)
    );
    if (updatedCourse) {
      payload = pipe(
        updatedCourse,
        parseData(CourseMapper.toBaseResponseDto, this.logger)
      );
    }

    return pipe(
      payload,
      prepareUpsertResponsePayload('course-base', true, !updatedCourse)
    );
  }

  private updateCourse(updateDto: UpdateCourseDto): Promise<Course> {
    const task = pipe(
      updateDto,

      // #1. validate the command dto
      // NOTE: this will also occur in the command itself
      // but the Runtype.check function is such a useful way to
      // also make sure the types are correct. Better than typecasting
      parseActionData(UpdateCourseDto.check, this.logger),

      // #2. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateCourseCommand(commandDto);
            return await this.commandBus.execute<UpdateCourseCommand>(command);
          },
          (error: unknown) => error as Error
        )
      ),

      // #3. catch the update error specifically
      TE.orElse((err) => {
        return err instanceof RepositoryItemUpdateError
          ? TE.right(undefined)
          : TE.left(err);
      })
    );

    return executeTask(task);
  }

  private findCourse(requestDto: UpdateCourseRequestDto): Promise<Course> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(FindCourseMapper.fromUpdateCourseRequestDto, this.logger),

      // #2. call the query
      TE.chain((findDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindCourseQuery(findDto);
            return await this.queryBus.execute<FindCourseQuery>(query);
          },
          (error: unknown) => error as Error
        )
      )
    );

    return executeTask(task);
  }

  private findCourseById(validDto: UpdateCourseRequestDto): Promise<Course> {
    const task = pipe(
      validDto,

      // #1. transform dto
      parseActionData(FindCourseMapper.fromUpdateCourseRequestDto, this.logger),

      // #2. call the query
      TE.chain((findDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindCourseQuery(findDto);
            return await this.queryBus.execute<FindCourseQuery>(query);
          },
          (error: unknown) => error as Error
        )
      )
    );

    return executeTask(task);
  }

  private findCourseSource(
    validDto: UpdateCourseRequestDto
  ): Promise<CourseSource> {
    const task = pipe(
      validDto,

      // #1. transform dto
      parseActionData(
        FindCourseSourceMapper.fromUpdateCourseRequestDto,
        this.logger
      ),

      // #2. call the query
      TE.chain((findDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindCourseSourceQuery(findDto);
            return await this.queryBus.execute<FindCourseSourceQuery>(query);
          },
          (error: unknown) => error as Error
        )
      )
    );

    return executeTask(task);
  }
}
