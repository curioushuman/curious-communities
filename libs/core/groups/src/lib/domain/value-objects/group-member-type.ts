import { Static } from 'runtypes';
import { GroupType } from './group-type';

export const GroupMemberType = GroupType.withBrand('GroupMemberType');

export type GroupMemberType = Static<typeof GroupMemberType>;
