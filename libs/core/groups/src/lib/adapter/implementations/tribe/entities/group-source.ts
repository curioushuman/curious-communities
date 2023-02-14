import { Boolean, Record, Static, String } from 'runtypes';
import { GroupName } from '../../../../domain/value-objects/group-name';
import { GroupSlug } from '../../../../domain/value-objects/group-slug';
import { GroupSourceId } from '../../../../domain/value-objects/group-source-id';

/**
 * This represents data we expect from Tribe
 * - some fields may be empty
 * - Tribe generally loves to return them as Null
 */
export const TribeApiGroupSource = Record({
  id: GroupSourceId,
  name: GroupName,
  slug: GroupSlug,
  status: String,
});

export type TribeApiGroupSource = Static<typeof TribeApiGroupSource>;

/**
 * An optional type if the structure for entity creation is different
 * - e.g. Tribe requires a password and connection, but doesn't return them
 */
export const TribeApiGroupSourceForCreate = TribeApiGroupSource.omit(
  'id',
  'status'
).extend({
  privacy: String,
  verified: Boolean,
  registration: String,
});

export type TribeApiGroupSourceForCreate = Static<
  typeof TribeApiGroupSourceForCreate
>;

/**
 * An optional type if the structure for entity creation is different
 * - e.g. Tribe requires a password and connection, but doesn't return them
 */
export const TribeApiGroupSourceForUpdate = TribeApiGroupSource.omit(
  'id',
  'status'
);

export type TribeApiGroupSourceForUpdate = Static<
  typeof TribeApiGroupSourceForUpdate
>;
