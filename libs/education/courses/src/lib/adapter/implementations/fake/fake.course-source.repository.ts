import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  CourseSource,
  CourseSourceIdentifier,
} from '../../../domain/entities/course-source';
import {
  CourseSourceFindMethod,
  CourseSourceRepository,
} from '../../ports/course-source.repository';
import { CourseSourceBuilder } from '../../../test/builders/course-source.builder';
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';
import { CourseSourceIdSource } from '../../../domain/value-objects/course-source-id-source';

@Injectable()
export class FakeCourseSourceRepository implements CourseSourceRepository {
  private courseSources: CourseSource[] = [];

  constructor() {
    this.courseSources.push(CourseSourceBuilder().exists().build());
    this.courseSources.push(CourseSourceBuilder().updated().build());
    this.courseSources.push(
      CourseSourceBuilder().invalidSource().buildNoCheck()
    );
    this.courseSources.push(CourseSourceBuilder().alpha().build());
    this.courseSources.push(CourseSourceBuilder().beta().build());
    this.courseSources.push(
      CourseSourceBuilder().invalidStatus().buildNoCheck()
    );
  }

  findOneByIdSource = (
    value: CourseSourceIdSource
  ): TE.TaskEither<Error, CourseSource> => {
    return TE.tryCatch(
      async () => {
        const id = CourseSourceId.check(value.id);
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

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<CourseSourceIdentifier, CourseSourceFindMethod> = {
    idSource: this.findOneByIdSource,
  };

  findOne = (identifier: CourseSourceIdentifier): CourseSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  save = (courseSource: CourseSource): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const courseExists = this.courseSources.find(
          (cs) => cs.id === courseSource.id
        );
        if (courseExists) {
          this.courseSources = this.courseSources.map((cs) =>
            cs.id === courseSource.id ? courseSource : cs
          );
        } else {
          this.courseSources.push(courseSource);
        }
      },
      (reason: unknown) => reason as Error
    );
  };
}
