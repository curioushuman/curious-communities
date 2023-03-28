import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  confirmSourceId,
  SalesforceApiRepository,
  SourceRepository,
  SalesforceApiRepositoryProps,
} from '@curioushuman/common';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';

import {
  CourseSource,
  CourseSourceIdentifier,
} from '../../../domain/entities/course-source';
import {
  CourseSourceFindMethod,
  CourseSourceRepository,
} from '../../ports/course-source.repository';
import { SalesforceApiCourseSource } from './entities/course-source';
import { SalesforceApiCourseSourceMapper } from './course-source.mapper';
import { Source } from '../../../domain/value-objects/source';
import { CourseSourceIdSource } from '../../../domain/value-objects/course-source-id-source';

@Injectable()
export class SalesforceApiCourseSourceRepository
  implements CourseSourceRepository, SourceRepository<Source>
{
  private salesforceApiRepository: SalesforceApiRepository<
    CourseSource,
    SalesforceApiCourseSource
  >;

  /**
   * The key for this source
   */
  public readonly SOURCE = 'COURSE';

  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    this.logger.setContext(SalesforceApiCourseSourceRepository.name);

    // set up the repository
    const props: SalesforceApiRepositoryProps = {
      sourceName: 'Case',
      sourceRuntype: SalesforceApiCourseSource,
    };
    this.salesforceApiRepository = new SalesforceApiRepository(
      props,
      this.httpService,
      this.logger
    );
  }

  processFindOne =
    (source: Source) =>
    (item?: SalesforceApiCourseSource, uri = 'not provided'): CourseSource => {
      // did we find anything?
      if (!item) {
        throw new RepositoryItemNotFoundError(
          `Course not found for uri: ${uri}`
        );
      }

      // is it what we expected?
      // will throw error if not
      const courseItem = SalesforceApiCourseSource.check(item);

      this.logger.debug(item, 'processFindOne');

      // NOTE: if the response was invalid, an error would have been thrown
      // could this similarly be in a serialisation decorator?
      return SalesforceApiCourseSourceMapper.toDomain(courseItem, source);
    };

  /**
   * ? should the confirmSourceId also be in a tryCatch or similar?
   */
  findOneByIdSource = (
    value: CourseSourceIdSource
  ): TE.TaskEither<Error, CourseSource> => {
    // NOTE: this will throw an error if the value is invalid
    const id = confirmSourceId<CourseSourceIdSource>(
      CourseSourceIdSource.check(value),
      this.SOURCE
    );
    return this.salesforceApiRepository.tryFindOne(
      id,
      this.processFindOne(this.SOURCE)
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
}
