import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CourseRepository } from '../../../adapter/ports/course.repository';
import { UpdateCourseDto } from './update-course.dto';
import { UpdateCourseMapper } from './update-course.mapper';
import { Course } from '../../../domain/entities/course';
import { CourseRepositoryErrorFactory } from '../../../adapter/ports/course.repository.error-factory';

export class UpdateCourseCommand implements ICommand {
  constructor(public readonly updateCourseDto: UpdateCourseDto) {}
}

/**
 * Command handler for update course
 * TODO
 * - [ ] better associated course check
 *       e.g. check against local IDs rather than just existence of courseId
 */
@CommandHandler(UpdateCourseCommand)
export class UpdateCourseHandler
  implements ICommandHandler<UpdateCourseCommand>
{
  constructor(
    private readonly courseRepository: CourseRepository,
    private logger: LoggableLogger,
    private courseErrorFactory: CourseRepositoryErrorFactory
  ) {
    this.logger.setContext(UpdateCourseHandler.name);
  }

  async execute(command: UpdateCourseCommand): Promise<Course> {
    const { updateCourseDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      updateCourseDto,
      parseData(UpdateCourseDto.check, this.logger, 'SourceInvalidError')
    );

    const { course, courseSource } = validDto;

    const task = pipe(
      // #2. prepare entity for update
      parseData(
        UpdateCourseMapper.fromSourceToCourse(course),
        this.logger,
        'SourceInvalidError'
      )(courseSource),

      // #3. make sure an update is required
      parseData(
        UpdateCourseMapper.isCourseUpdated(course),
        this.logger,
        'SourceInvalidError'
      ),

      // #4. update the entity, from the source; if required
      O.fromNullable,
      O.fold(
        // if null, return the original course
        () => TE.right(course),
        // otherwise, update and return
        (uc) =>
          performAction(
            uc,
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
