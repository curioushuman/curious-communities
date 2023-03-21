import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import {
  DynamoDbFindOneParams,
  DynamoDbRepository,
  DynamoDbRepositoryProps,
} from '@curioushuman/common';

import {
  CourseFindMethod,
  CourseRepository,
} from '../../ports/course.repository';
import { CourseId } from '../../../domain/value-objects/course-id';
import {
  CourseBase,
  CourseFilters,
  CourseIdentifier,
  prepareCourseExternalIdSource,
} from '../../../domain/entities/course';
import { DynamoDbCourseMapper } from './course.mapper';
import { CourseSlug } from '../../../domain/value-objects/course-slug';
import { CourseSourceIdSourceValue } from '../../../domain/value-objects/course-source-id-source';
import { DynamoDbCourse } from './entities/course';
import { CoursesItem } from './entities/item';

/**
 * A repository for courses
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 * - we're using composition rather than inheritance here
 */
@Injectable()
export class DynamoDbCourseRepository implements CourseRepository {
  private dynamoDbRepository: DynamoDbRepository<CourseBase, CoursesItem>;

  constructor(private logger: LoggableLogger) {
    this.logger.setContext(DynamoDbCourseRepository.name);

    // set up the repository
    const props: DynamoDbRepositoryProps = {
      entityId: 'course',
      tableId: 'courses',
      globalIndexes: ['slug', 'source-id-COURSE'],
      prefix: 'cc',
    };
    this.dynamoDbRepository = new DynamoDbRepository(props, this.logger);
  }

  processFindOne(
    item?: Record<string, unknown>,
    params?: DynamoDbFindOneParams
  ): CourseBase {
    // did we find anything?
    if (!item) {
      throw new RepositoryItemNotFoundError(
        DynamoDbRepository.prepareErrorMessage('Course not found', params)
      );
    }

    // is it what we expected?
    // will throw error if not
    const courseItem = DynamoDbCourse.check(item);

    // NOTE: if the response was invalid, an error would have been thrown
    // could this similarly be in a serialisation decorator?
    return DynamoDbCourseMapper.toDomain(courseItem);
  }

  /**
   * NOTE: Currently does not return participants
   */
  findOneById = (value: CourseId): TE.TaskEither<Error, CourseBase> => {
    // Set the parameters.
    // Course in DDB has PK = courseId and SK = courseId
    const params = this.dynamoDbRepository.prepareParamsGetOne({
      partitionKey: value,
    });
    return this.dynamoDbRepository.tryGetOne(params, this.processFindOne);
  };

  findOneBySlug = (value: CourseSlug): TE.TaskEither<Error, CourseBase> => {
    // Set the parameters.
    const params = this.dynamoDbRepository.prepareParamsQueryOne({
      indexId: 'slug',
      value,
    });
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
  };

  findOneByIdSourceValue = (
    value: CourseSourceIdSourceValue
  ): TE.TaskEither<Error, CourseBase> => {
    // Set the parameters.
    const { source } = prepareCourseExternalIdSource(value);
    const params = this.dynamoDbRepository.prepareParamsQueryOne({
      indexId: `source-id-${source}`,
      value,
    });
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

  /**
   * It is at this stage we know
   * - what the dto/input looks like
   * - what DDB indexes we have
   * So it is here, that we reshape the input to match the indexes
   *
   * NOTE: this has to be a scan, because no matter what we'll be
   * querying across partitions. Each partition being a course.
   *
   * NOTE: You could, if performance suffered, created a new index with a PK
   * or each day, with the course fields only. Only if required.
   *
   * TODO:
   * - [ ] more dynamic method of mapping the filters
   */
  findAll = (props: {
    filters: CourseFilters;
  }): TE.TaskEither<Error, CourseBase[]> => {
    const { filters } = props;
    const { dateOpenRange } = filters;
    const params = this.dynamoDbRepository.prepareParamsFindAll({
      filters: { Course_DateOpen: dateOpenRange },
    });
    return this.dynamoDbRepository.tryFindAll(params, this.processFindOne);
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
