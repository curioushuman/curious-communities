import { Null, Optional, Record, Static, String } from 'runtypes';
import { CourseSourceId } from '../../../../domain/value-objects/course-source-id';
import { CourseSourceName } from '../../../../domain/value-objects/course-source-name';

/**
 * TODO
 * - [ ] description
 */

/**
 * This represents data we expect from Salesforce
 * - some fields may be empty
 * - Salesforce generally loves to return them as Null
 */
export const SalesforceApiCourseSource = Record({
  Id: CourseSourceId,
  Summary_quick_year__c: CourseSourceName,
  Date_start__c: Optional(String.Or(Null)),
  Date_end__c: Optional(String.Or(Null)),
});

export type SalesforceApiCourseSource = Static<
  typeof SalesforceApiCourseSource
>;
