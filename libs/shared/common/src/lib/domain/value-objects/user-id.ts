import { Static, String } from 'runtypes';

/**
 * TODO
 * - [ ] Deserves constraints
 */

export const UserId = String.withBrand('UserId');

export type UserId = Static<typeof UserId>;
