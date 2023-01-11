import { Static } from 'runtypes';

import {
  prepareExternalIdSourceRuntype,
  prepareExternalIdSourceValueRuntype,
} from '@curioushuman/common';

import { GroupMemberSourceId } from './group-member-source-id';
import { Source } from './source';

/**
 * This overrides the base structure for external ID + source
 *
 * NOTE: You have the option of overriding anywhere from none to all
 */
export const GroupMemberSourceIdSource = prepareExternalIdSourceRuntype(
  GroupMemberSourceId,
  Source
);

export type GroupMemberSourceIdSource = Static<
  typeof GroupMemberSourceIdSource
>;

/**
 * The type for an external ID and source combined into a single string
 */
export const GroupMemberSourceIdSourceValue =
  prepareExternalIdSourceValueRuntype(GroupMemberSourceId, Source);

export type GroupMemberSourceIdSourceValue = Static<
  typeof GroupMemberSourceIdSourceValue
>;
