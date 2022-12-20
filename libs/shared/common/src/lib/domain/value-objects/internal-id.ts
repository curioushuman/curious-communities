import { Static, String } from 'runtypes';
import * as uuid from 'uuid';

/**
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 *
 * TODO
 * - [ ] should this be more OO? e.g. createUUID
 */

export const UUIDRegex = /^[0-9a-z-_]+$/;

export const InternalId = String.withConstraint(
  (maybeUUID) => UUIDRegex.test(maybeUUID) || 'Invalid UUID'
);

export type InternalId = Static<typeof InternalId>;

export const createInternalId = (): InternalId => {
  return InternalId.check(uuid.v4());
};
