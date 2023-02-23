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
import {
  RepositoryItemNotFoundError,
  RepositoryItemUpdateError,
} from '@curioushuman/error-factory';

import { UpsertCourseRequestDto } from './dto/upsert-course.request.dto';
import { CreateCourseCommand } from '../../application/commands/create-course/create-course.command';
import { CourseMapper } from '../course.mapper';
import { FindCourseMapper } from '../../application/queries/find-course/find-course.mapper';
import { FindCourseQuery } from '../../application/queries/find-course/find-course.query';
import { UpdateCourseCommand } from '../../application/commands/update-course/update-course.command';
import { CourseBase } from '../../domain/entities/course';
import {
  prepareUpsertResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';
import { CourseSource } from '../../domain/entities/course-source';
import { FindCourseSourceMapper } from '../../application/queries/find-course-source/find-course-source.mapper';
import { FindCourseSourceQuery } from '../../application/queries/find-course-source/find-course-source.query';
import { CreateCourseDto } from '../../application/commands/create-course/create-course.dto';
import { UpdateCourseDto } from '../../application/commands/update-course/update-course.dto';

/**
 * Controller for create course operations
 */
@Controller()
export class UpsertCourseController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpsertCourseController.name);
  }

  /**
   * Public method to upsert a course
   *
   * TODO:
   * - [ ] whole thing could be done in fp-ts
   * ? [ ] should more of this logic be in a service?
   */
  public async upsert(
    requestDto: UpsertCourseRequestDto
  ): Promise<ResponsePayload<'course-base'>> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(UpsertCourseRequestDto.check, this.logger)
    );

    // #2. find source and course
    // NOTE: These will error if they need to
    const [course, courseSource] = await Promise.all([
      this.findCourse(validDto),
      this.findCourseSource(validDto),
    ]);

    // #3. upsert course
    // NOTE: we know that if no courseSource was found
    // an error would have been thrown
    const upsertTask = course
      ? this.updateCourse(courseSource as CourseSource, course)
      : this.createCourse(courseSource as CourseSource);
    const upsertedCourse = await executeTask(upsertTask);
    // we know that at this point, course would exist
    const payload = upsertedCourse || (course as CourseBase);

    // #4. return the response
    return pipe(
      payload,
      parseData(CourseMapper.toBaseResponseDto, this.logger),
      prepareUpsertResponsePayload(
        'course-base',
        !!course,
        course && !upsertedCourse
      )
    );
  }

  private createCourse(
    courseSource: CourseSource
  ): TE.TaskEither<Error, CourseBase> {
    return pipe(
      // #1. prepare dto
      { courseSource },

      // #2. validate the command dto
      // NOTE: this will also occur in the command itself
      // but the Runtype.check function is such a useful way to
      // also make sure the types are correct. Better than typecasting
      parseActionData(CreateCourseDto.check, this.logger),

      // #3. create the course
      TE.chain((createDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateCourseCommand(createDto);
            return await this.commandBus.execute<CreateCourseCommand>(command);
          },
          (error: unknown) => error as Error
        )
      )
    );
  }

  private updateCourse(
    courseSource: CourseSource,
    course: CourseBase
  ): TE.TaskEither<Error, CourseBase | undefined> {
    return pipe(
      {
        courseSource,
        course,
      },
      // #2. validate the command dto
      // NOTE: this will also occur in the command itself
      // but the Runtype.check function is such a useful way to
      // also make sure the types are correct. Better than typecasting
      parseActionData(UpdateCourseDto.check, this.logger),

      // #3. update the course
      TE.chain((updateDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateCourseCommand(updateDto);
            return await this.commandBus.execute<UpdateCourseCommand>(command);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. Catch the update error specifically
      // try/catch doesn't seem to work in lambda handler
      // so instead of throwing this error, we're returning undefined
      // to indicate to lambda to not continue with lambda level flows
      // TODO: this is a bit of a hack, need to figure out a better way
      TE.orElse((err) => {
        return err instanceof RepositoryItemUpdateError
          ? TE.right(undefined)
          : TE.left(err);
      })
    );
  }

  private findCourse(
    requestDto: UpsertCourseRequestDto
  ): Promise<CourseBase | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindCourseMapper.fromUpsertCourseRequestDto,
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
    requestDto: UpsertCourseRequestDto
  ): Promise<CourseSource | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindCourseSourceMapper.fromUpsertCourseRequestDto,
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
