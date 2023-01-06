import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { UpdateCourseRequestDto } from './dto/update-course.request.dto';
import { UpdateCourseMapper } from '../../application/commands/update-course/update-course.mapper';
import { UpdateCourseCommand } from '../../application/commands/update-course/update-course.command';
import { CourseMapper } from '../course.mapper';
import { CourseResponseDto } from '../dto/course.response.dto';

/**
 * Controller for update course operations
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
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(UpdateCourseController.name);
  }

  public async update(
    requestDto: UpdateCourseRequestDto
  ): Promise<CourseResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(UpdateCourseRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(parseActionData(UpdateCourseMapper.fromRequestDto, this.logger)),

      // #3. call the command
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

      // #4. transform to the response DTO
      TE.chain(parseActionData(CourseMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
