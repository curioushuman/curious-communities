import { Static } from 'runtypes';
import { prepareEnumRuntype } from '@curioushuman/common';
import { MemberSourceStatusEnum } from './member-source-status';

/**
 * Internal influenced by external
 */
export const MemberStatusEnum = MemberSourceStatusEnum;

export const MemberStatus = prepareEnumRuntype(MemberStatusEnum);

export type MemberStatus = Static<typeof MemberStatus>;
