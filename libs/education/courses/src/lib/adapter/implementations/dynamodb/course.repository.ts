import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';

import {
  CourseFindMethod,
  CourseRepository,
} from '../../ports/course.repository';
import { CourseId } from '../../../domain/value-objects/course-id';
import { CourseBase, CourseIdentifier } from '../../../domain/entities/course';
import { DynamoDbCourseMapper } from './course.mapper';
import { CourseSlug } from '../../../domain/value-objects/course-slug';
import { CourseSourceIdSourceValue } from '../../../domain/value-objects/course-source-id-source';
import { DynamoDbCourse } from './types/course';
import { DynamoDbRepository } from './dynamodb.repository';
import { DynamoDbFindOneParams } from './dynamodb.repository.types';

/**
 * A repository for courses
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 * - we're using composition rather than inheritance here
 */
@Injectable()
export class DynamoDbCourseRepository implements CourseRepository {
  private dynamoDbRepository: DynamoDbRepository<CourseBase>;

  constructor(private logger: LoggableLogger) {
    this.logger.setContext(DynamoDbCourseRepository.name);

    // set up the repository
    this.dynamoDbRepository = new DynamoDbRepository(
      'course',
      'courses',
      ['slug', 'source-id-value'],
      this.logger
    );
  }

  processFindOne(
    item?: Record<string, unknown>,
    params?: DynamoDbFindOneParams
  ): CourseBase {
    // did we find anything?
    if (!item) {
      let errorMsg = 'Course not found';
      if (params) {
        errorMsg += `: ${JSON.stringify(params)}`;
      }
      throw new RepositoryItemNotFoundError(errorMsg);
    }

    // is it what we expected?
    // will throw error if not
    const courseItem = DynamoDbCourse.check(item);

    // NOTE: if the response was invalid, an error would have been thrown
    // could this similarly be in a serialisation decorator?
    return DynamoDbCourseMapper.toDomain(courseItem);
  }

  findOneById = (value: CourseId): TE.TaskEither<Error, CourseBase> => {
    // Set the parameters.
    // Course in DDB has the same PK and SK as the parent of a one-to-many relationship
    const params = this.dynamoDbRepository.prepareParamsGet(value, value);
    return this.dynamoDbRepository.tryGetOne(params, this.processFindOne);
  };

  findOneBySlug = (value: CourseSlug): TE.TaskEither<Error, CourseBase> => {
    // Set the parameters.
    const params = this.dynamoDbRepository.prepareParamsQueryOne(
      'slug',
      'Slug',
      value
    );
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
  };

  findOneByIdSourceValue = (
    value: CourseSourceIdSourceValue
  ): TE.TaskEither<Error, CourseBase> => {
    // Set the parameters.
    const params = this.dynamoDbRepository.prepareParamsQueryOne(
      'source-id-value',
      'SourceIdCOURSE',
      value
    );
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
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

  processSave(
    course: CourseBase
  ): (item?: Record<string, unknown>) => CourseBase {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (_?: Record<string, unknown>) => {
      // I'm uncertain what particularly to do in here...
      // ? should we process the attributes?
      // const courseItem = DynamoDbCourse.check(item);
      // return DynamoDbCourseMapper.toDomain(courseItem);

      // currently, if there were no errors per se
      // we're just returning the course as it was
      return course;
    };
  }

  /**
   * NOTE: we do not first find the course. This responsibility
   * is delegated to the service/application layer. If a record is
   * passed to this layer, it is with full knowledge of what is
   * going to happen. i.e. save, and save alone.
   */
  save = (course: CourseBase): TE.TaskEither<Error, CourseBase> => {
    const item = DynamoDbCourseMapper.toPersistence(course);
    const params = this.dynamoDbRepository.preparePutParams(item);
    return this.dynamoDbRepository.trySave(params, this.processSave(course));
  };
}
