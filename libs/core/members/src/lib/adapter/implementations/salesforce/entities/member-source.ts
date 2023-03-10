import { Null, Optional, Record, Static } from 'runtypes';

import { MemberEmail } from '../../../../domain/value-objects/member-email';
import { MemberName } from '../../../../domain/value-objects/member-name';
import { MemberOrganisationName } from '../../../../domain/value-objects/member-organisation-name';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';

/**
 * TODO
 * - [ ] description
 */

/**
 * This represents data we expect from Salesforce
 * - some fields may be empty
 * - Salesforce generally loves to return them as Null
 */
export const SalesforceApiMemberSource = Record({
  Id: MemberSourceId,
  Full_name_custom__c: MemberName,
  Email: MemberEmail,
  Organisation_name__c: Optional(MemberOrganisationName.Or(Null)),
});

export type SalesforceApiMemberSource = Static<
  typeof SalesforceApiMemberSource
>;
