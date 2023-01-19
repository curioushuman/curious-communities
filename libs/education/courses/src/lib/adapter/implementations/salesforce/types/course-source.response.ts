import { Array, Null, Optional, Record, Static, String } from 'runtypes';
import { CourseSourceId } from '../../../../domain/value-objects/course-source-id';
import { CourseSourceName } from '../../../../domain/value-objects/course-source-name';
import { SalesforceApiResponse } from './base-response';

/**
 * TODO
 * - [ ] description
 */

/**
 * This represents data we expect from Salesforce
 * - some fields may be empty
 * - Salesforce generally loves to return them as Null
 */
export const SalesforceApiCourseSourceResponse = SalesforceApiResponse.extend({
  Id: CourseSourceId,
  Summary_quick_year__c: CourseSourceName,
  Date_start__c: Optional(String.Or(Null)),
  Date_end__c: Optional(String.Or(Null)),
});

export type SalesforceApiCourseSourceResponse = Static<
  typeof SalesforceApiCourseSourceResponse
>;

export const SalesforceApiCourseSourceResponses = Record({
  records: Array(SalesforceApiCourseSourceResponse),
});

export type SalesforceApiCourseSourceResponses = Static<
  typeof SalesforceApiCourseSourceResponses
>;
