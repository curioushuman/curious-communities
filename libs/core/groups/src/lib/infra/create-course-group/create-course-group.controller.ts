import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CreateCourseGroupRequestDto } from './dto/create-course-group.request.dto';
import { CreateCourseGroupMapper } from '../../application/commands/create-course-group/create-course-group.mapper';
import { CreateCourseGroupCommand } from '../../application/commands/create-course-group/create-course-group.command';
import { CourseGroupResponseDto } from '../dto/course-group.response.dto';
import { CourseGroupMapper } from '../course-group.mapper';

/**
 * Controller for create course-group operations
 */

@Controller()
export class CreateCourseGroupController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(CreateCourseGroupController.name);
  }

  public async create(
    requestDto: CreateCourseGroupRequestDto
  ): Promise<CourseGroupResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(CreateCourseGroupRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(CreateCourseGroupMapper.fromRequestDto, this.logger)
      ),

      // #3. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateCourseGroupCommand(commandDto);
            return await this.commandBus.execute<CreateCourseGroupCommand>(
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
