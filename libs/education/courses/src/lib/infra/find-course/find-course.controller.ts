import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  FindByIdCourseRequestDto,
  FindByIdSourceValueCourseRequestDto,
  FindCourseRequestDto,
} from './dto/find-course.request.dto';
import { FindCourseMapper } from '../../application/queries/find-course/find-course.mapper';
import { FindCourseQuery } from '../../application/queries/find-course/find-course.query';
import { CourseBaseResponseDto } from '../dto/course.response.dto';
import { CourseMapper } from '../course.mapper';

/**
 * Controller for find course operations
 */

@Controller()
export class FindCourseController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(FindCourseController.name);
  }

  public async find(
    requestDto: FindCourseRequestDto
  ): Promise<CourseBaseResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindCourseRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(FindCourseMapper.fromFindRequestDto, this.logger)
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindCourseQuery(queryDto);
            return await this.queryBus.execute<FindCourseQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(CourseMapper.toBaseResponseDto, this.logger))
    );

    return executeTask(task);
  }

  public async findById(
    requestDto: FindByIdCourseRequestDto
  ): Promise<CourseBaseResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindByIdCourseRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(FindCourseMapper.fromFindByIdRequestDto, this.logger)
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindCourseQuery(queryDto);
            return await this.queryBus.execute<FindCourseQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(CourseMapper.toBaseResponseDto, this.logger))
    );

    return executeTask(task);
  }

  public async findByIdSourceValue(
    requestDto: FindByIdSourceValueCourseRequestDto
  ): Promise<CourseBaseResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindByIdSourceValueCourseRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(
          FindCourseMapper.fromFindByIdSourceValueRequestDto,
          this.logger
        )
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindCourseQuery(queryDto);
            return await this.queryBus.execute<FindCourseQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(CourseMapper.toBaseResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
