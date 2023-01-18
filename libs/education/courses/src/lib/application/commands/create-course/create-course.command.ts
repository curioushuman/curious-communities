import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CourseRepository } from '../../../adapter/ports/course.repository';
import { CreateCourseDto } from './create-course.dto';
import { CreateCourseMapper } from './create-course.mapper';
import { Course } from '../../../domain/entities/course';
import { CourseRepositoryErrorFactory } from '../../../adapter/ports/course.repository.error-factory';

export class CreateCourseCommand implements ICommand {
  constructor(public readonly createCourseDto: CreateCourseDto) {}
}

/**
 * Command handler for create course
 * TODO
 * - [ ] better associated course check
 *       e.g. check against local IDs rather than just existence of courseId
 */
@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler
  implements ICommandHandler<CreateCourseCommand>
{
  constructor(
    private readonly courseRepository: CourseRepository,
    private logger: LoggableLogger,
    private courseErrorFactory: CourseRepositoryErrorFactory
  ) {
    this.logger.setContext(CreateCourseHandler.name);
  }

  async execute(command: CreateCourseCommand): Promise<Course> {
    const { createCourseDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      createCourseDto,
      parseData(CreateCourseDto.check, this.logger, 'SourceInvalidError')
    );

    const { courseSource } = validDto;

    const task = pipe(
      courseSource,

      // #2. transform from dto to entity
      parseActionData(
        CreateCourseMapper.fromSourceToCourse,
        this.logger,
        'SourceInvalidError'
      ),

      // #2. update the entity, from the source
      TE.chain((course) =>
        performAction(
          course,
          this.courseRepository.save,
          this.courseErrorFactory,
          this.logger,
          `save course from source`
        )
      )
    );

    return executeTask(task);
  }
}
