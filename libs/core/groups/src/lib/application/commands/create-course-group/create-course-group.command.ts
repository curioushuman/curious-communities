import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  ErrorFactory,
  RepositoryItemConflictError,
} from '@curioushuman/error-factory';
import { executeTask, performAction } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CreateCourseGroupDto } from './create-course-group.dto';
import { CourseGroup } from '../../../domain/entities/course-group';
import { CourseGroupRepository } from '../../../adapter/ports/course-group.repository';

export class CreateCourseGroupCommand implements ICommand {
  constructor(public readonly createCourseGroupDto: CreateCourseGroupDto) {}
}

/**
 * Command handler for create course group
 */
@CommandHandler(CreateCourseGroupCommand)
export class CreateCourseGroupHandler
  implements ICommandHandler<CreateCourseGroupCommand>
{
  constructor(
    private readonly courseGroupRepository: CourseGroupRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateCourseGroupHandler.name);
  }

  async execute(command: CreateCourseGroupCommand): Promise<CourseGroup> {
    const { createCourseGroupDto } = command;

    // can safely destructure the dto here, because we know it's valid
    const { group } = createCourseGroupDto;

    const task = pipe(
      // createCourseGroupDto,
      // #1. validate the dto
      // handled in mapper

      // #2. check if the course group already exists
      performAction(
        group.courseId,
        this.courseGroupRepository.check('courseId'),
        this.errorFactory,
        this.logger,
        `check for existing course group: ${group.courseId}`
      ),

      // #3. if the group exists, throw an error
      // otherwise create the group
      TE.chain((groupExists) => {
        if (groupExists === true) {
          throw new RepositoryItemConflictError(
            `CourseGroup: ${group.courseId}`
          );
        }

        return performAction(
          group,
          this.courseGroupRepository.save,
          this.errorFactory,
          this.logger,
          `save courseGroup`
        );
      })
    );

    return executeTask(task);
  }
}
