import { Static } from 'runtypes';

import {
  prepareExternalIdSourceRuntype,
  prepareExternalIdSourceValueRuntype,
} from '@curioushuman/common';

import { MemberSourceId } from './member-source-id';
import { Source } from './source';

/**
 * This overrides the base structure for external ID + source
 *
 * NOTE: You have the option of overriding anywhere from none to all
 */
export const MemberSourceIdSource = prepareExternalIdSourceRuntype(
  MemberSourceId,
  Source
);

export type MemberSourceIdSource = Static<typeof MemberSourceIdSource>;

/**
 * The type for an external ID and source combined into a single string
 */
export const MemberSourceIdSourceValue = prepareExternalIdSourceValueRuntype(
  MemberSourceId,
  Source
);

export type MemberSourceIdSourceValue = Static<
  typeof MemberSourceIdSourceValue
>;
