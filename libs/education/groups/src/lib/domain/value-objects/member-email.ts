import { Static } from 'runtypes';

import { Email } from '@curioushuman/common';

/**
 * Member Email type specification
 *
 * NOTE: we're not storing this in a central location to keep coupling low
 * it will mean duplication but it's a small price to pay for the benefits
 */
export const MemberEmail = Email.withBrand('MemberEmail');

export type MemberEmail = Static<typeof MemberEmail>;
