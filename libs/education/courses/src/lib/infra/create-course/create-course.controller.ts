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

import { CreateCourseRequestDto } from './dto/create-course.request.dto';
import { CreateCourseCommand } from '../../application/commands/create-course/create-course.command';
import { CourseResponseDto } from '../dto/course.response.dto';
import { CourseMapper } from '../course.mapper';
import { CourseSource } from '../../domain/entities/course-source';
import { FindCourseMapper } from '../../application/queries/find-course/find-course.mapper';
import { FindCourseQuery } from '../../application/queries/find-course/find-course.query';
import {
  RepositoryItemConflictError,
  RepositoryItemNotFoundError,
} from '@curioushuman/error-factory';
import { Course } from '../../domain/entities/course';
import { CreateCourseDto } from '../../application/commands/create-course/create-course.dto';

/**
 * Controller for create course operations
 *
 * TODO
 * - [ ] should this actually be a service?
 * - [ ] should we be doing auth. here as well?
 *       OR is it ok that we're assuming it is done at higher levels?
 *       AKA it seems like a waste of resources to repeat the same task
 *       ONLY if auth. at this level differs from higher ups should we implement
 */

@Controller()
export class CreateCourseController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(CreateCourseController.name);
  }

  public async create(
    requestDto: CreateCourseRequestDto
  ): Promise<CourseResponseDto> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(CreateCourseRequestDto.check, this.logger)
    );

    // #2. find source and course
    // NOTE: These will error if they need to
    const [course, courseSource] = await Promise.all([
      this.findCourse(validDto),
      this.findCourseSource(validDto),
    ]);

    // if a course exists, throw an error, go no further
    if (course) {
      throw new RepositoryItemConflictError(`Course id: ${course.id}`);
    }

    // otherwise, crack on
    const createDto = {
      courseSource,
    };

    const task = pipe(
      createDto,

      // #3. validate the dto
      parseActionData(CreateCourseDto.check, this.logger),

      // #4. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateCourseCommand(commandDto);
            return await this.commandBus.execute<CreateCourseCommand>(command);
          },
          (error: unknown) => error as Error
        )
      ),

      // #5. transform to the response DTO
      TE.chain(parseActionData(CourseMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }

  private findCourse(
    requestDto: CreateCourseRequestDto
  ): Promise<Course | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(FindCourseMapper.fromCreateCourseRequestDto, this.logger),

      // #2. call the query
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindCourseQuery(findDto);
              return await this.queryBus.execute<FindCourseQuery>(query);
            },
            (error: unknown) => error as Error
          ),
          // check if it's a notFound error just return undefined
          // otherwise, continue on the left path with the error
          TE.orElse((err) => {
            return err instanceof RepositoryItemNotFoundError
              ? TE.right(undefined)
              : TE.left(err);
          })
        )
      )
    );

    return executeTask(task);
  }

  private findCourseSource(
    requestDto: CreateCourseRequestDto
  ): Promise<CourseSource | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindCourseSourceMapper.fromCreateCourseRequestDto,
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
