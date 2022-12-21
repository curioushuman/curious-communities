import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { CourseSource } from '../../../domain/entities/course-source';
import { CourseSourceRepository } from '../../ports/course-source.repository';
import { CourseSourceBuilder } from '../../../test/builders/course-source.builder';
import { FindCourseSourceDto } from '../../../application/queries/find-course-source/find-course-source.dto';

@Injectable()
export class FakeCourseSourceRepository implements CourseSourceRepository {
  private courseSources: CourseSource[] = [];

  constructor() {
    this.courseSources.push(CourseSourceBuilder().exists().build());
    this.courseSources.push(
      CourseSourceBuilder().invalidSource().buildNoCheck()
    );
    this.courseSources.push(CourseSourceBuilder().alpha().build());
    this.courseSources.push(CourseSourceBuilder().beta().build());
    this.courseSources.push(
      CourseSourceBuilder().invalidStatus().buildNoCheck()
    );
  }

  findOne = (dto: FindCourseSourceDto): TE.TaskEither<Error, CourseSource> => {
    const { id } = dto;
    return TE.tryCatch(
      async () => {
        const courseSource = this.courseSources.find((cs) => cs.id === id);
        return pipe(
          courseSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Course source with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (source) => CourseSource.check(source)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };
}
