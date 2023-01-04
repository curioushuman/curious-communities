import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import {
  ErrorFactory,
  RepositoryItemConflictError,
  RepositoryItemNotFoundError,
} from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CourseRepository } from '../../../adapter/ports/course.repository';
import { CreateCourseDto } from './create-course.dto';
import { CreateCourseMapper } from './create-course.mapper';
import { CourseSourceRepository } from '../../../adapter/ports/course-source.repository';
import { CourseSource } from '../../../domain/entities/course-source';
import { CourseMapper } from '../../course.mapper';

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
    private readonly courseSourceRepository: CourseSourceRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateCourseHandler.name);
  }

  async execute(command: CreateCourseCommand): Promise<void> {
    const { createCourseDto } = command;

    const task = pipe(
      // #1. parse the dto
      // we want two DTOs 1. to find source, and 2. find course
      sequenceT(TE.ApplySeq)(
        parseActionData(
          CreateCourseMapper.toFindCourseSourceDto,
          this.logger,
          'RequestInvalidError'
        )(createCourseDto),
        parseActionData(
          CreateCourseMapper.toFindCourseDto,
          this.logger,
          'RequestInvalidError'
        )(createCourseDto)
      ),

      // #2. Find the source, and the course (to be updated)
      TE.chain(([findCourseSourceDto, findCourseDto]) =>
        sequenceT(TE.ApplySeq)(
          performAction(
            findCourseSourceDto,
            this.courseSourceRepository.findOne,
            this.errorFactory,
            this.logger,
            `find course source: ${findCourseSourceDto.id}`
          ),
          performAction(
            findCourseDto.value,
            this.courseRepository.check(findCourseDto.identifier),
            this.errorFactory,
            this.logger,
            `check for existing course: ${findCourseDto.value}`
          )
        )
      ),

      // #3. validate + transform; courses exists, source is valid, source to course
      TE.chain(([courseSource, courseExists]) => {
        if (!courseSource) {
          throw new RepositoryItemNotFoundError(
            `Course source id: ${createCourseDto.id}`
          );
        }
        if (courseExists === true) {
          throw new RepositoryItemConflictError(
            `Course id: ${createCourseDto.id}`
          );
        }
        return pipe(
          courseSource,
          parseActionData(
            CourseSource.check,
            this.logger,
            'SourceInvalidError'
          ),
          TE.chain((courseSourceChecked) =>
            parseActionData(
              CourseMapper.fromSourceToCourse,
              this.logger,
              'SourceInvalidError'
            )(courseSourceChecked)
          )
        );
      }),

      // #5. update the course, from the source
      TE.chain((course) =>
        performAction(
          course,
          this.courseRepository.save,
          this.errorFactory,
          this.logger,
          `save course from source`
        )
      )
    );

    return executeTask(task);
  }
}
