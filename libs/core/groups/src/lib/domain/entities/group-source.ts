import { Record, Static } from 'runtypes';

import { GroupSourceId } from '../value-objects/group-source-id';
import { GroupSourceStatus } from '../value-objects/group-source-status';
import { GroupSourceIdSource } from '../value-objects/group-source-id-source';
import { Source } from '../value-objects/source';
import { GroupName } from '../value-objects/group-name';
import { GroupSlug } from '../value-objects/group-slug';

/**
 * Type for external group entity
 */
export const GroupSource = Record({
  id: GroupSourceId,
  source: Source,

  status: GroupSourceStatus,
  name: GroupName,
  slug: GroupSlug,
});

/**
 * Type for external group entity
 */
export type GroupSource = Static<typeof GroupSource>;

/**
 * Type for external group entity, minus Id
 * Used for creating a new group
 */
export const GroupSourceForCreate = GroupSource.omit('id', 'source');

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
  name: GroupName;
};
export type GroupSourceIdentifier = keyof GroupSourceIdentifiers;
