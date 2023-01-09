import { Record, Static } from 'runtypes';

import { ValueOf } from '@curioushuman/common';

import { GroupSourceStatus } from '../value-objects/group-source-status';
import { GroupName } from '../value-objects/group-name';
import { GroupSourceId } from '../value-objects/group-source-id';
import { GroupSourceIdSource } from '../value-objects/group-source-id-source';

/**
 * Type for external group entity
 */
export const GroupSource = Record({
  id: GroupSourceId,
  status: GroupSourceStatus,
  name: GroupName,
});

/**
 * Type for external group entity
 */
export type GroupSource = Static<typeof GroupSource>;

/**
 * Type for external group entity, minus Id
 * Used for creating a new group
 */
export const GroupSourceForCreate = GroupSource.omit('id');
/**
 * Type for external group entity, minus Id
 * Used for creating a new group
 */
export type GroupSourceForCreate = Static<typeof GroupSourceForCreate>;

/**
 * Type that defines all the possible identifiers for a group
 * NOTE: this is utilized in find-group.dto.ts and group.repository.ts
 * to define parsers and finders.
 */
export type GroupSourceIdentifiers = {
  idSource: GroupSourceIdSource;
};
export type GroupSourceIdentifier = keyof GroupSourceIdentifiers;
export type GroupSourceIdentifierValue = ValueOf<GroupSourceIdentifiers>;
