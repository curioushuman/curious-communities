import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { UpdateCourseGroupRequestDto } from './dto/update-course-group.request.dto';
import { UpdateCourseGroupMapper } from '../../application/commands/update-course-group/update-course-group.mapper';
import { UpdateCourseGroupCommand } from '../../application/commands/update-course-group/update-course-group.command';
import { CourseGroupResponseDto } from '../dto/course-group.response.dto';
import { CourseGroupMapper } from '../course-group.mapper';

/**
 * Controller for update course-group operations
 */

@Controller()
export class UpdateCourseGroupController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(UpdateCourseGroupController.name);
  }

  public async update(
    requestDto: UpdateCourseGroupRequestDto
  ): Promise<CourseGroupResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(UpdateCourseGroupRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(UpdateCourseGroupMapper.fromRequestDto, this.logger)
      ),

      // #3. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateCourseGroupCommand(commandDto);
            return await this.commandBus.execute<UpdateCourseGroupCommand>(
              command
            );
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(CourseGroupMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
