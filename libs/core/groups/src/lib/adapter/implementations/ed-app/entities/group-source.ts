import { Record, Static } from 'runtypes';
import { GroupName } from '../../../../domain/value-objects/group-name';
import { GroupSourceId } from '../../../../domain/value-objects/group-source-id';

/**
 * This represents data we expect from EdApp
 * - some fields may be empty
 * - EdApp generally loves to return them as Null
 */
export const EdAppApiGroupSource = Record({
  id: GroupSourceId,
  name: GroupName,
});

export type EdAppApiGroupSource = Static<typeof EdAppApiGroupSource>;

/**
 * An optional type if the structure for entity creation is different
 * - e.g. EdApp requires a password and connection, but doesn't return them
 */
export const EdAppApiGroupSourceForCreate = EdAppApiGroupSource.omit('id');

export type EdAppApiGroupSourceForCreate = Static<
  typeof EdAppApiGroupSourceForCreate
>;

/**
 * An optional type if the structure for entity creation is different
 * - e.g. EdApp requires a password and connection, but doesn't return them
 */
export const EdAppApiGroupSourceForUpdate = EdAppApiGroupSource.omit('id');

export type EdAppApiGroupSourceForUpdate = Static<
  typeof EdAppApiGroupSourceForUpdate
>;
