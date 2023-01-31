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
 * Any fields not natively stored by Auth0 we can keep in Metadata
 */
export const Auth0ApiMemberSourceMetadataResponse = Record({
  organisation_name: Optional(MemberOrganisationName.Or(Null)),
});

export type Auth0ApiMemberSourceMetadataResponse = Static<
  typeof Auth0ApiMemberSourceMetadataResponse
>;

/**
 * This represents data we expect from Auth0
 * - some fields may be empty
 * - Auth0 generally loves to return them as Null
 */
export const Auth0ApiMemberSourceResponse = Record({
  user_id: MemberSourceId,
  name: MemberName,
  email: MemberEmail,
  user_metadata: Optional(Auth0ApiMemberSourceMetadataResponse.Or(Null)),
});

export type Auth0ApiMemberSourceResponse = Static<
  typeof Auth0ApiMemberSourceResponse
>;
