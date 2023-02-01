import { Null, Optional, Record, Static, String } from 'runtypes';
import { MemberEmail } from '../../../../domain/value-objects/member-email';
import { MemberName } from '../../../../domain/value-objects/member-name';
import { MemberOrganisationName } from '../../../../domain/value-objects/member-organisation-name';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';

/**
 * Any fields not natively stored by Auth0 we can keep in Metadata
 */
export const Auth0ApiMemberSourceMetadata = Record({
  organisation_name: Optional(MemberOrganisationName.Or(Null)),
});

export type Auth0ApiMemberSourceMetadata = Static<
  typeof Auth0ApiMemberSourceMetadata
>;

/**
 * This represents data we expect from Auth0
 * - some fields may be empty
 * - Auth0 generally loves to return them as Null
 */
export const Auth0ApiMemberSource = Record({
  user_id: MemberSourceId,
  name: MemberName,
  email: MemberEmail,
  user_metadata: Optional(Auth0ApiMemberSourceMetadata.Or(Null)),
});

export type Auth0ApiMemberSource = Static<typeof Auth0ApiMemberSource>;

/**
 * An optional type if the structure for entity creation is different
 * - e.g. Auth0 requires a password and connection, but doesn't return them
 */
export const Auth0ApiMemberSourceForCreate = Auth0ApiMemberSource.omit(
  'user_id'
).extend({
  connection: String,
  password: String,
});

export type Auth0ApiMemberSourceForCreate = Static<
  typeof Auth0ApiMemberSourceForCreate
>;
