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
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';

import { CreateCourseRequestDto } from './dto/create-course.request.dto';
import { CreateCourseCommand } from '../../application/commands/create-course/create-course.command';
import { CourseMapper } from '../course.mapper';
import { CourseSource } from '../../domain/entities/course-source';
import { FindCourseMapper } from '../../application/queries/find-course/find-course.mapper';
import { FindCourseQuery } from '../../application/queries/find-course/find-course.query';
import { CourseBase } from '../../domain/entities/course';
import { CreateCourseDto } from '../../application/commands/create-course/create-course.dto';
import { FindCourseSourceMapper } from '../../application/queries/find-course-source/find-course-source.mapper';
import { FindCourseSourceQuery } from '../../application/queries/find-course-source/find-course-source.query';
import {
  prepareResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';

/**
 * Controller for create course operations
 *
 * ! POTENTIAL FOR DEPRECATION
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
  ): Promise<ResponsePayload<'course-base'>> {
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
    // UPDATE: log the error, don't throw it
    // we don't want the calling lambda to fail/retry
    // try/catch at the lambda level doesn't seem to work
    if (course) {
      // throw new RepositoryItemConflictError(`Group id: ${course.id}`);
      this.logger.error(
        `Course already exists with id: ${course.id}`,
        'RepositoryItemConflictError'
      );
      return pipe(
        course,
        parseData(CourseMapper.toBaseResponseDto, this.logger),
        prepareResponsePayload('course-base', 'created', 'failure')
      );
    }

    // otherwise, crack on
    const task = pipe(
      {
        courseSource,
      },

      // #3. validate the command dto
      // NOTE: this will also occur in the command itself
      // but the Runtype.check function is such a useful way to
      // also make sure the types are correct. Better than typecasting
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
      TE.chain(parseActionData(CourseMapper.toBaseResponseDto, this.logger)),
      TE.map(prepareResponsePayload('course-base', 'created', 'success'))
    );

    return executeTask(task);
  }

  private findCourse(
    requestDto: CreateCourseRequestDto
  ): Promise<CourseBase | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindCourseMapper.fromCreateCourseRequestDto,
        this.logger,
        'RequestInvalidError'
      ),

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
