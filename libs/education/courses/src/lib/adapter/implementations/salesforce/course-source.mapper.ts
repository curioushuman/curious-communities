import { Timestamp } from '@curioushuman/common';
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
    const now = Date.now();
    if (now < dateOpen || (dateClosed && now > dateClosed)) {
      return CourseSourceStatusEnum.CLOSED;
    }
    return CourseSourceStatusEnum.ACTIVE;
  }

  /**
   * TODO: find a better place to put the timezone stuff; value, and functions
   */
  public static prepareTimestamp(
    dateString: string | null | undefined
  ): Timestamp | undefined {
    if (!dateString) {
      return undefined;
    }
    const timestampUtc = new Date(dateString).getTime();
    const timestampTimezone =
      timestampUtc + config.timezone.offset * 60 * 60 * 1000;
    return Timestamp.check(timestampTimezone);
  }
}
