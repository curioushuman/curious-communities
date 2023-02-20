import { Static } from 'runtypes';
import { prepareEnumRuntype } from '@curioushuman/common';
import { GroupSourceStatusEnum } from './group-source-status';

/**
 * At this stage, we're going to align the internal with the external
 */
export const GroupStatusEnum = GroupSourceStatusEnum;

export const GroupStatus = prepareEnumRuntype(GroupStatusEnum);

export type GroupStatus = Static<typeof GroupStatus>;
