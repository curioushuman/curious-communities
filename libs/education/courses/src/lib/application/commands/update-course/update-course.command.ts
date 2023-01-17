import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CourseRepository } from '../../../adapter/ports/course.repository';
import { UpdateCourseDto } from './update-course.dto';
import { UpdateCourseMapper } from './update-course.mapper';
import { CourseSourceRepository } from '../../../adapter/ports/course-source.repository';
import { CourseSource } from '../../../domain/entities/course-source';
import { Course } from '../../../domain/entities/course';
import { CourseRepositoryErrorFactory } from '../../../adapter/ports/course.repository.error-factory';
import { CourseSourceRepositoryErrorFactory } from '../../../adapter/ports/course-source.repository.error-factory';

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
    private readonly courseSourceRepository: CourseSourceRepository,
    private logger: LoggableLogger,
    private courseErrorFactory: CourseRepositoryErrorFactory,
    private courseSourceErrorFactory: CourseSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(UpdateCourseHandler.name);
  }

  async execute(command: UpdateCourseCommand): Promise<Course> {
    const { updateCourseDto } = command;

    const task = pipe(
      // #1. parse the dto
      // we want two DTOs 1. to find source, and 2. find course
      sequenceT(TE.ApplySeq)(
        parseActionData(
          UpdateCourseMapper.toFindCourseSourceDto,
          this.logger,
          'RequestInvalidError'
        )(updateCourseDto),
        parseActionData(
          UpdateCourseMapper.toFindCourseDto,
          this.logger,
          'RequestInvalidError'
        )(updateCourseDto)
      ),

      // #2. Find the source, and the course (to be updated)
      TE.chain(([findCourseSourceDto, findCourseDto]) =>
        sequenceT(TE.ApplySeq)(
          performAction(
            findCourseSourceDto,
            this.courseSourceRepository.findOne,
            this.courseSourceErrorFactory,
            this.logger,
            `find course source: ${findCourseSourceDto.id}`
          ),
          performAction(
            findCourseDto.value,
            this.courseRepository.findOne(findCourseDto.identifier),
            this.courseErrorFactory,
            this.logger,
            `find course: ${findCourseDto.value}`
          )
        )
      ),

      // #3. validate + transform; courses exists, source is valid, source to course
      TE.chain(([courseSource, existingCourse]) =>
        pipe(
          courseSource,
          parseActionData(
            CourseSource.check,
            this.logger,
            'SourceInvalidError'
          ),
          TE.chain((courseSourceChecked) =>
            parseActionData(
              UpdateCourseMapper.fromSourceToCourse(existingCourse),
              this.logger,
              'SourceInvalidError'
            )(courseSourceChecked)
          )
        )
      ),

      // #5. update the course, from the source
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
