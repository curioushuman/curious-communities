import { Array, Null, Optional, Record, Static, String } from 'runtypes';
import { MemberEmail } from '../../../../domain/value-objects/member-email';
import { MemberName } from '../../../../domain/value-objects/member-name';
import { MemberOrganisationName } from '../../../../domain/value-objects/member-organisation-name';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';

/**
 * Some personal info stored in a sub-object
 */
export const EdAppApiMemberSourceCustomFields = Record({
  organisationName: Optional(MemberOrganisationName.Or(Null)),
});

/**
 * This represents data we expect from EdApp
 * - some fields may be empty
 * - EdApp generally loves to return them as Null
 */
export const EdAppApiMemberSource = Record({
  id: MemberSourceId,
  // name is actually username
  name: MemberEmail,
  email: MemberEmail,
  customFields: Optional(EdAppApiMemberSourceCustomFields.Or(Null)),
});

export type EdAppApiMemberSource = Static<typeof EdAppApiMemberSource>;

/**
 * An optional type if the structure for entity creation is different
 * - e.g. EdApp requires a password and connection, but doesn't return them
 */
export const EdAppApiMemberSourceForCreate = EdAppApiMemberSource.omit(
  'id'
).extend({
  roles: Array(String),
  password: String,
});

export type EdAppApiMemberSourceForCreate = Static<
  typeof EdAppApiMemberSourceForCreate
>;
