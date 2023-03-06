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
import { FindCourseMapper } from '../../application/queries/find-course/find-course.mapper';
import { FindCourseQuery } from '../../application/queries/find-course/find-course.query';
import { UpdateCourseCommand } from '../../application/commands/update-course/update-course.command';
import { UpdateCourseMapper } from '../../application/commands/update-course/update-course.mapper';
import { CourseMapper } from '../course.mapper';
import { CourseBase } from '../../domain/entities/course';
import {
  prepareUpsertResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';

/**
 * Controller for update course operations
 *
 * TODO:
 * - [ ] whole thing could be done in fp-ts
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
   * ? [ ] should more of this logic be in a service?
   */
  public async update(
    requestDto: UpdateCourseRequestDto
  ): Promise<ResponsePayload<'course-base'>> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(UpdateCourseRequestDto.check, this.logger)
    );

    // #2. find course
    // NOTE: These will error if they need to
    // ? this kind of logic is questionable in a controller!!!
    // NOTE: if request was internal, we can skip these checks
    if (validDto.requestSource !== RequestSourceEnum.INTERNAL) {
      // we are not going to use the course OR course here, but we need to check if it exists
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const course = await this.findCourse(validDto);
    }

    // #3. update course
    const updatedCourse = await executeTask(this.updateCourse(validDto));

    // #4. return the response
    let payload = validDto.course;
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

  private updateCourse(
    validDto: UpdateCourseRequestDto
  ): TE.TaskEither<Error, CourseBase | undefined> {
    return pipe(
      validDto,
      parseActionData(
        UpdateCourseMapper.fromUpdateCourseRequestDto,
        this.logger
      ),
      TE.chain((updateDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateCourseCommand(updateDto);
            return await this.commandBus.execute<UpdateCourseCommand>(command);
          },
          (error: unknown) => error as Error
        )
      ),

      // Catch the update error specifically
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

  private findCourse(requestDto: UpdateCourseRequestDto): Promise<CourseBase> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindCourseMapper.fromUpdateCourseRequestDto,
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
          )
        )
      )
    );

    return executeTask(task);
  }
}
