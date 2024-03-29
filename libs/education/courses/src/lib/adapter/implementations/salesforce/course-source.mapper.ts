import {
  Timestamp,
  timezoneNow,
  timezoneTimestamp,
} from '@curioushuman/common';
import { CourseSource } from '../../../domain/entities/course-source';
import {
  CourseSourceStatus,
  CourseSourceStatusEnum,
} from '../../../domain/value-objects/course-source-status';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import { SalesforceApiCourseSource } from './entities/course-source';

export class SalesforceApiCourseSourceMapper {
  /**
   * Note: responsibility for slug creation left to the create-course.command
   *
   * TODO:
   * - [ ] remove status, we don't need it. Should be based on dateOpen and dateClosed
   * - [ ] add dateOpen and dateClosed
   *
   */
  public static toDomain(
    sourceResponse: SalesforceApiCourseSource,
    source: Source
  ): CourseSource {
    const dateOpen = SalesforceApiCourseSourceMapper.prepareTimestamp(
      sourceResponse.Date_start__c
    );
    const dateClosed = SalesforceApiCourseSourceMapper.prepareTimestamp(
      sourceResponse.Date_end__c
    );
    return CourseSource.check({
      id: sourceResponse.Id,
      source,
      name: sourceResponse.Summary_quick_year__c,
      status: SalesforceApiCourseSourceMapper.determineStatus(
        dateOpen,
        dateClosed
      ),
      dateOpen,
      dateClosed,
    });
  }

  /**
   * This function is used to determine the status of a course
   * where no status field is provided at this specific source.
   */
  public static determineStatus(
    dateOpen: Timestamp | undefined,
    dateClosed: Timestamp | undefined
  ): CourseSourceStatus {
    if (!dateOpen) {
      return CourseSourceStatusEnum.PENDING;
    }
    const now = timezoneNow(config);
    if (now < dateOpen || (dateClosed && now > dateClosed)) {
      return CourseSourceStatusEnum.CLOSED;
    }
    return CourseSourceStatusEnum.ACTIVE;
  }

  /**
   * This function does need to use the timezoneTimestamp function
   * as the date string from SF is date only, not date time.
   *
   * If we ever have a dateTime (or ISO) string, then we wouldn't use the timezone function
   */
  public static prepareTimestamp(
    dateString: string | null | undefined
  ): Timestamp | undefined {
    if (!dateString) {
      return undefined;
    }
    return Timestamp.check(timezoneTimestamp(dateString, config));
  }
}
