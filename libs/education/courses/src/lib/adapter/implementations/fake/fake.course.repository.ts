import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { prepareExternalIdSource } from '@curioushuman/common';

import { Course, CourseIdentifier } from '../../../domain/entities/course';
import {
  CourseCheckMethod,
  CourseFindMethod,
  CourseRepository,
} from '../../ports/course.repository';
import { CourseBuilder } from '../../../test/builders/course.builder';
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';
import { ParticipantSourceIdSourceValue } from '../../../domain/value-objects/participant-source-id-source';
import { CourseId } from '../../../domain/value-objects/course-id';
import { Source } from '../../../domain/value-objects/source';
import { CourseSourceIdSourceValue } from '../../../domain/value-objects/course-source-id-source';
import { CourseSlug } from '../../../domain/value-objects/course-slug';

@Injectable()
export class FakeCourseRepository implements CourseRepository {
  private courses: Course[] = [];

  constructor() {
    this.courses.push(CourseBuilder().exists().build());
  }

  findOneById = (id: CourseSourceId): TE.TaskEither<Error, Course> => {
    return TE.tryCatch(
      async () => {
        const course = this.courses.find((cs) => cs.id === id);
        return pipe(
          course,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(`Course with id ${id} not found`);
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (course) => Course.check(course)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  findOneByIdSourceValue = (
    value: ParticipantSourceIdSourceValue
  ): TE.TaskEither<Error, Course> => {
    return TE.tryCatch(
      async () => {
        const idSourceValue = ParticipantSourceIdSourceValue.check(value);
        const idSource = prepareExternalIdSource(
          idSourceValue,
          CourseSourceId,
          Source
        );
        const course = this.courses.find((cs) => {
          const matches = cs.sourceIds.filter(
            (sId) => sId.id === idSource.id && sId.source === idSource.source
          );
          return matches.length > 0;
        });
        return pipe(
          course,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Course with idSource ${idSourceValue} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (course) => Course.check(course)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  findOneBySlug = (slug: CourseSlug): TE.TaskEither<Error, Course> => {
    return TE.tryCatch(
      async () => {
        const course = this.courses.find((cs) => cs.slug === slug);
        return pipe(
          course,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(`Course with slug ${slug} not found`);
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (course) => Course.check(course)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<CourseIdentifier, CourseFindMethod> = {
    id: this.findOneById,
    idSourceValue: this.findOneByIdSourceValue,
    slug: this.findOneBySlug,
  };

  findOne = (identifier: CourseIdentifier): CourseFindMethod => {
    return this.findOneBy[identifier];
  };

  checkById = (id: CourseId): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const course = this.courses.find((cs) => cs.id === id);
        return pipe(
          course,
          O.fromNullable,
          O.fold(
            () => false,
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_) => true
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  checkByIdSourceValue = (
    value: CourseSourceIdSourceValue
  ): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const idSourceValue = ParticipantSourceIdSourceValue.check(value);
        const idSource = prepareExternalIdSource(
          idSourceValue,
          CourseSourceId,
          Source
        );
        const course = this.courses.find((cs) => {
          const matches = cs.sourceIds.filter(
            (sId) => sId.id === idSource.id && sId.source === idSource.source
          );
          return matches.length > 0;
        });
        return pipe(
          course,
          O.fromNullable,
          O.fold(
            () => false,
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_) => true
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  checkBySlug = (slug: CourseSlug): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const course = this.courses.find((cs) => cs.slug === slug);
        return pipe(
          course,
          O.fromNullable,
          O.fold(
            () => false,
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_) => true
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for checkBy methods
   */
  checkBy: Record<CourseIdentifier, CourseCheckMethod> = {
    id: this.checkById,
    idSourceValue: this.checkByIdSourceValue,
    slug: this.checkBySlug,
  };

  check = (identifier: CourseIdentifier): CourseCheckMethod => {
    return this.checkBy[identifier];
  };

  save = (course: Course): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const courseExists = this.courses.find((cs) => cs.id === course.id);
        if (courseExists) {
          this.courses = this.courses.map((cs) =>
            cs.id === course.id ? course : cs
          );
        } else {
          this.courses.push(course);
        }
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, Course[]> => {
    return TE.right(this.courses);
  };
}
