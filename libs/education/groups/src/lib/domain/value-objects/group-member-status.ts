import { Static } from 'runtypes';
import { GroupMemberSourceStatus } from './group-member-source-status';

/**
 * ? Should we define the list twice?
 */
export const GroupMemberStatus =
  GroupMemberSourceStatus.withBrand('GroupMemberStatus');

export type GroupMemberStatus = Static<typeof GroupMemberStatus>;
