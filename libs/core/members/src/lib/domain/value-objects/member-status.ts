import { Static } from 'runtypes';
import { MemberSourceStatus } from './member-source-status';

/**
 * ? Should we define the list twice?
 */
export const MemberStatus = MemberSourceStatus.withBrand('MemberStatus');

export type MemberStatus = Static<typeof MemberStatus>;
