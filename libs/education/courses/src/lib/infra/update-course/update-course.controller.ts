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

import { UpdateCourseRequestDto } from './dto/update-course.request.dto';
import { UpdateCourseCommand } from '../../application/commands/update-course/update-course.command';
import { CourseBaseResponseDto } from '../dto/course.response.dto';
import { CourseMapper } from '../course.mapper';
import { CourseSource } from '../../domain/entities/course-source';
import { FindCourseMapper } from '../../application/queries/find-course/find-course.mapper';
import { FindCourseQuery } from '../../application/queries/find-course/find-course.query';
import { Course } from '../../domain/entities/course';
import { UpdateCourseDto } from '../../application/commands/update-course/update-course.dto';
import { FindCourseSourceMapper } from '../../application/queries/find-course-source/find-course-source.mapper';
import { FindCourseSourceQuery } from '../../application/queries/find-course-source/find-course-source.query';

/**
 * Controller for update course operations
 *
 * NOTES
 * - we initially returned void for create/update actions
 *   see create controller for more info
 *
 * TODO
 * - [ ] should this actually be a service?
 * - [ ] should we be doing auth. here as well?
 *       OR is it ok that we're assuming it is done at higher levels?
 *       AKA it seems like a waste of resources to repeat the same task
 *       ONLY if auth. at this level differs from higher ups should we implement
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

  public async update(
    requestDto: UpdateCourseRequestDto
  ): Promise<CourseBaseResponseDto> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(UpdateCourseRequestDto.check, this.logger)
    );

    // #2. find source and course
    // NOTE: These will error if they need to
    // including NotFound for either
    const [course, courseSource] = await Promise.all([
      this.findCourse(validDto),
      this.findCourseSource(validDto),
    ]);

    // set up the command dto
    const updateDto = {
      course,
      courseSource,
    };

    const task = pipe(
      updateDto,

      // #3. validate the dto
      // NOTE: this will also occur in the command itself
      // but the Runtype.check function is such a useful way to
      // also make sure the types are correct. Better than typecasting
      parseActionData(UpdateCourseDto.check, this.logger, 'SourceInvalidError'),

      // #4. call the command
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

      // #5. transform to the response DTO
      TE.chain(parseActionData(CourseMapper.toBaseResponseDto, this.logger))
    );

    return executeTask(task);
  }

  private findCourse(
    requestDto: UpdateCourseRequestDto
  ): Promise<Course | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(FindCourseMapper.fromUpdateCourseRequestDto, this.logger),

      // #2. call the query
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindCourseQuery(findDto);
              return await this.queryBus.execute<FindCourseQuery>(query);
            },
            (error: unknown) => error as Error
          )
        )
      )
    );

    return executeTask(task);
  }

  private findCourseSource(
    requestDto: UpdateCourseRequestDto
  ): Promise<CourseSource | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindCourseSourceMapper.fromUpdateCourseRequestDto,
        this.logger
      ),

      // #2. call the query
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindCourseSourceQuery(findDto);
              return await this.queryBus.execute<FindCourseSourceQuery>(query);
            },
            (error: unknown) => error as Error
          )
        )
      )
    );

    return executeTask(task);
  }
}
