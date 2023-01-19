import { Array, Null, Optional, Record, Static } from 'runtypes';
import { CourseSourceId } from '../../../../domain/value-objects/course-source-id';
import { ParticipantEmail } from '../../../../domain/value-objects/participant-email';
import { ParticipantName } from '../../../../domain/value-objects/participant-name';
import { ParticipantOrganisationName } from '../../../../domain/value-objects/participant-organisation-name';
import { ParticipantSourceId } from '../../../../domain/value-objects/participant-source-id';
import { ParticipantSourceStatus } from '../../../../domain/value-objects/participant-source-status';
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
export const SalesforceApiParticipantSourceResponse =
  SalesforceApiResponse.extend({
    Id: ParticipantSourceId,
    Case__c: CourseSourceId,
    Status__c: ParticipantSourceStatus,
    Contact_full_name__c: ParticipantName,
    Contact_email__c: ParticipantEmail,
    SYS_Organisation_name__c: Optional(ParticipantOrganisationName.Or(Null)),
  });

export type SalesforceApiParticipantSourceResponse = Static<
  typeof SalesforceApiParticipantSourceResponse
>;

export const SalesforceApiParticipantSourceResponses = Record({
  records: Array(SalesforceApiParticipantSourceResponse),
});

export type SalesforceApiParticipantSourceResponses = Static<
  typeof SalesforceApiParticipantSourceResponses
>;
