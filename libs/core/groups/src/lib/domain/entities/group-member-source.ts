import { Record, Static } from 'runtypes';

import { GroupMemberSourceStatus } from '../value-objects/group-member-source-status';
import { GroupMemberName } from '../value-objects/group-member-name';
import { GroupMemberEmail } from '../value-objects/group-member-email';
import { GroupMemberOrganisationName } from '../value-objects/group-member-organisation-name';
import { GroupMemberSourceId } from '../value-objects/group-member-source-id';
import { GroupMemberSourceIdSource } from '../value-objects/group-member-source-id-source';
import { Source } from '../value-objects/source';
import { GroupSourceId } from '../value-objects/group-source-id';

export const GroupMemberSource = Record({
  id: GroupMemberSourceId,
  groupId: GroupSourceId,
  source: Source,

  status: GroupMemberSourceStatus,
  name: GroupMemberName,
  email: GroupMemberEmail,
  organisationName: GroupMemberOrganisationName,
});

export type GroupMemberSource = Static<typeof GroupMemberSource>;

/**
 * Type for external group member entity, minus Id and source
 * Used for creating a new group member
 */
export const GroupMemberSourceForCreate = GroupMemberSource.omit(
  'id',
  'source'
);
/**
 * Type for external group member entity, minus Id and source
 * Used for creating a new group member
 */
export type GroupMemberSourceForCreate = Static<
  typeof GroupMemberSourceForCreate
>;

/**
 * Type that defines all the possible identifiers for a group
 * NOTE: this is utilized in find-group.dto.ts and group.repository.ts
 * to define parsers and finders.
 */
export type GroupMemberSourceIdentifiers = {
  idSource: GroupMemberSourceIdSource;
  email: GroupMemberEmail;
};
export type GroupMemberSourceIdentifier = keyof GroupMemberSourceIdentifiers;
