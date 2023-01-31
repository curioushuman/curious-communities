import { Timestamp } from '@curioushuman/common';
import { CourseSource } from '../../../domain/entities/course-source';
import { CourseSourceStatus } from '../../../domain/value-objects/course-source-status';
import { Source } from '../../../domain/value-objects/source';
import { SalesforceApiCourseSourceResponse } from './entities/course-source.response';

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
    sourceResponse: SalesforceApiCourseSourceResponse,
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
      return 'pending' as CourseSourceStatus;
    }
    const now = Date.now();
    if (now < dateOpen || (dateClosed && now > dateClosed)) {
      return 'closed' as CourseSourceStatus;
    }
    return 'open' as CourseSourceStatus;
  }

  public static prepareTimestamp(
    dateString: string | null | undefined
  ): Timestamp | undefined {
    return dateString
      ? (new Date(dateString).getTime() as Timestamp)
      : undefined;
  }
}
