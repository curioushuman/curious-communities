import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
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
import { CourseBase } from '../../../domain/entities/course';
import { CourseRepositoryErrorFactory } from '../../../adapter/ports/course.repository.error-factory';
import { RepositoryItemUpdateError } from '@curioushuman/error-factory';

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

  async execute(command: UpdateCourseCommand): Promise<CourseBase> {
    const { updateCourseDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      updateCourseDto,
      parseData(
        UpdateCourseDto.check,
        this.logger,
        'InternalRequestInvalidError'
      )
    );

    const { course } = validDto;

    // #2 validate/parse the group from the DTO
    const parsedCourse = this.parseDto(validDto);

    const task = pipe(
      parsedCourse,

      // #3. update the entity, from the source; if required
      O.fromNullable,
      O.fold(
        // if null, return the original course
        () => {
          const msg = `Course ${course.id} does not need to be updated from source`;
          this.logger.error(msg);
          throw new RepositoryItemUpdateError(msg);
        },
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

  parseDto(validDto: UpdateCourseDto): CourseBase | undefined {
    const { course, courseSource } = validDto;
    // if no courseSource it means we're doing a straight update
    // so we skip the requiresUpdate check
    if (!courseSource) {
      return course;
    }
    return pipe(
      courseSource,
      // #4. update the entity, from the course/source
      parseData(
        UpdateCourseMapper.fromSourceToCourse(course),
        this.logger,
        'SourceInvalidError'
      ),
      // #3. make sure an update is required
      parseData(
        UpdateCourseMapper.requiresUpdate<CourseBase>(course),
        this.logger,
        'InternalRequestInvalidError'
      )
    );
  }
}
