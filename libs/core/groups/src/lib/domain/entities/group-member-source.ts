import { Record, Static } from 'runtypes';

import { ValueOf } from '@curioushuman/common';

import { GroupMemberSourceStatus } from '../value-objects/group-member-source-status';
import { GroupMemberName } from '../value-objects/group-member-name';
import { GroupMemberEmail } from '../value-objects/group-member-email';
import { GroupMemberOrganisationName } from '../value-objects/group-member-organisation-name';
import { GroupMemberSourceId } from '../value-objects/group-member-source-id';
import { GroupMemberSourceIdSource } from '../value-objects/group-member-source-id-source';
import { GroupSourceId } from '../value-objects/group-source-id';
import { GroupMemberForSourceIdentify } from './group-member';

/**
 * Type for external member entity
 */
export const GroupMemberSource = Record({
  id: GroupMemberSourceId,
  groupId: GroupSourceId,
  status: GroupMemberSourceStatus,

  name: GroupMemberName,
  email: GroupMemberEmail,
  organisationName: GroupMemberOrganisationName,
});

/**
 * Type for external member entity
 */
export type GroupMemberSource = Static<typeof GroupMemberSource>;

/**
 * Type for external member entity, minus Id
 * Used for creating a new member
 */
export const GroupMemberSourceForCreate = GroupMemberSource.omit('id');
/**
 * Type for external member entity, minus Id
 * Used for creating a new member
 */
export type GroupMemberSourceForCreate = Static<
  typeof GroupMemberSourceForCreate
>;

/**
 * Type that defines all the possible identifiers for a member
 * NOTE: this is utilized in find-member.dto.ts and member.repository.ts
 * to define parsers and finders.
 */
export type GroupMemberSourceIdentifiers = {
  idSource: GroupMemberSourceIdSource;
  // we're using this slightly modified version of the entity type
  // as we need to make sure some generally optional values are present
  // for the purposes of identification
  entity: GroupMemberForSourceIdentify;
};
export type GroupMemberSourceIdentifier = keyof GroupMemberSourceIdentifiers;
export type GroupMemberSourceIdentifierValue =
  ValueOf<GroupMemberSourceIdentifiers>;
