import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { ErrorFactory } from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { UpdateCourseGroupDto } from './update-course-group.dto';
import { CourseGroup } from '../../../domain/entities/course-group';
import { CourseGroupRepository } from '../../../adapter/ports/course-group.repository';
import { UpdateCourseGroupMapper } from './update-course-group.mapper';

export class UpdateCourseGroupCommand implements ICommand {
  constructor(public readonly updateCourseGroupDto: UpdateCourseGroupDto) {}
}

/**
 * Command handler for update course group
 */
@CommandHandler(UpdateCourseGroupCommand)
export class UpdateCourseGroupHandler
  implements ICommandHandler<UpdateCourseGroupCommand>
{
  constructor(
    private readonly courseGroupRepository: CourseGroupRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(UpdateCourseGroupHandler.name);
  }

  async execute(command: UpdateCourseGroupCommand): Promise<CourseGroup> {
    const { updateCourseGroupDto } = command;

    // we can safely destructure as the DTO has been validated in mapper
    const { course } = updateCourseGroupDto;

    const task = pipe(
      // updateCourseGroupDto,
      // #1. validate the dto
      // done in mapper

      // #2. find the existing entity
      // NOTE if not found, an error will be thrown
      performAction(
        course.id,
        this.courseGroupRepository.findOne('courseId'),
        this.errorFactory,
        this.logger,
        `find existing course group: ${course.id}`
      ),

      // #3. update the entity
      TE.chain((courseGroup) =>
        pipe(
          courseGroup,
          parseActionData(
            UpdateCourseGroupMapper.fromCourseToCourseGroup(course),
            this.logger,
            'RequestInvalidError'
          )
        )
      ),

      // #3. save the entity
      TE.chain((updatedCourseGroup) =>
        performAction(
          updatedCourseGroup,
          this.courseGroupRepository.save,
          this.errorFactory,
          this.logger,
          `save courseGroup`
        )
      )
    );

    return executeTask(task);
  }
}
