import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

/**
 * Member Id type specification
 *
 * NOTE: we're not storing this in a central location to keep coupling low
 * it will mean duplication but it's a small price to pay for the benefits
 */
export const MemberId = ExternalId.withBrand('MemberId');

export type MemberId = Static<typeof MemberId>;
