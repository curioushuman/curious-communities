import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { prepareExternalIdSource } from '@curioushuman/common';

import {
  Course,
  CourseBase,
  CourseIdentifier,
} from '../../../domain/entities/course';
import {
  CourseFindMethod,
  CourseRepository,
} from '../../ports/course.repository';
import { CourseBuilder } from '../../../test/builders/course.builder';
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';
import { Source } from '../../../domain/value-objects/source';
import { CourseSourceIdSourceValue } from '../../../domain/value-objects/course-source-id-source';
import { CourseSlug } from '../../../domain/value-objects/course-slug';
import { CourseName } from '../../../domain/value-objects/course-name';

@Injectable()
export class FakeCourseRepository implements CourseRepository {
  private courses: Course[] = [];

  private renameCourse = (course: Course): Course => {
    return Course.check({
      ...course,
      name: 'Renamed Course' as CourseName,
    });
  };

  constructor() {
    this.courses.push(CourseBuilder().exists().build());
    this.courses.push(this.renameCourse(CourseBuilder().updated().build()));
    const invalidSource = CourseBuilder().invalidSource().buildNoCheck();
    invalidSource.name = 'Invalid Source' as CourseName;
    this.courses.push(invalidSource);
    console.log(this.courses);
    this.courses.forEach((c) => console.log(c.sourceIds));
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
    value: CourseSourceIdSourceValue
  ): TE.TaskEither<Error, Course> => {
    return TE.tryCatch(
      async () => {
        const idSourceValue = CourseSourceIdSourceValue.check(value);
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

  save = (courseBase: CourseBase): TE.TaskEither<Error, Course> => {
    return TE.tryCatch(
      async () => {
        const courseExists = this.courses.find((cs) => cs.id === courseBase.id);
        let course: Course;
        if (courseExists) {
          course = {
            ...courseBase,
            participants: courseExists.participants,
          };
          this.courses = this.courses.map((cs) =>
            cs.id === course.id ? course : cs
          );
        } else {
          course = {
            ...courseBase,
            participants: [],
          };
          this.courses.push(course);
        }
        return course;
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, Course[]> => {
    return TE.right(this.courses);
  };
}
