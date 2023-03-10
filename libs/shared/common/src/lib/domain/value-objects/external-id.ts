import { Static, String } from 'runtypes';

/**
 * TODO
 * - [ ] How can we get constraints in here?
 *       Particularly if we use various adapters
 *       e.g. how do I include SF specific ID constraints?
 */

export const ExternalId = String.withBrand('ExternalId').withConstraint(
  (externalId) => !!externalId || `Id cannot be empty`
);

export type ExternalId = Static<typeof ExternalId>;
