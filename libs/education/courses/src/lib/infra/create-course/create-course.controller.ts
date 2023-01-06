import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CreateCourseRequestDto } from './dto/create-course.request.dto';
import { CreateCourseMapper } from '../../application/commands/create-course/create-course.mapper';
import { CreateCourseCommand } from '../../application/commands/create-course/create-course.command';
import { CourseResponseDto } from '../dto/course.response.dto';
import { CourseMapper } from '../course.mapper';

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
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(CreateCourseController.name);
  }

  public async create(
    requestDto: CreateCourseRequestDto
  ): Promise<CourseResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(CreateCourseRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(parseActionData(CreateCourseMapper.fromRequestDto, this.logger)),

      // #3. call the command
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

      // #4. transform to the response DTO
      TE.chain(parseActionData(CourseMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
