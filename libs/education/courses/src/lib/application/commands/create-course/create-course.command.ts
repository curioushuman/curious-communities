import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import {
  ErrorFactory,
  RepositoryItemConflictError,
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
import { CourseSourceForCreate } from '../../../domain/entities/course-source';

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
      createCourseDto,
      parseActionData(
        CreateCourseMapper.toFindCourseSourceDto,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. find the source
      TE.chain((findSourceDto) =>
        performAction(
          findSourceDto,
          this.courseSourceRepository.findOne,
          this.errorFactory,
          this.logger,
          'find course source'
        )
      ),

      // #3. parse the source
      TE.chain((courseSource) =>
        sequenceT(TE.ApplySeq)(
          parseActionData(
            CourseSourceForCreate.check,
            this.logger,
            'SourceInvalidError'
          )(courseSource),
          parseActionData(
            CreateCourseMapper.fromSourceToFindCourseDto,
            this.logger,
            'SourceInvalidError'
          )(courseSource),
          parseActionData(
            CreateCourseMapper.fromSourceToCourse,
            this.logger,
            'SourceInvalidError'
          )(courseSource)
        )
      ),

      // #4. check for conflict
      TE.chain(([source, findCourseDto, courseFromSource]) =>
        pipe(
          performAction(
            findCourseDto.value,
            this.courseRepository.findById,
            this.errorFactory,
            this.logger,
            `check course exists for source: ${source.id}`
          ),
          TE.chain((existingCourse) => {
            throw new RepositoryItemConflictError(existingCourse.name);
          }),
          TE.alt(() => TE.right(courseFromSource))
        )
      ),

      // #5. create the course, from the source
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
