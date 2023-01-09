import { Static } from 'runtypes';

import {
  prepareExternalIdSourceRuntype,
  prepareExternalIdSourceValueRuntype,
} from '@curioushuman/common';

import { GroupSourceId } from './group-source-id';
import { Source } from './source';

/**
 * This overrides the base structure for external ID + source
 *
 * NOTE: You have the option of overriding anywhere from none to all
 */
export const GroupSourceIdSource = prepareExternalIdSourceRuntype(
  GroupSourceId,
  Source
);

export type GroupSourceIdSource = Static<typeof GroupSourceIdSource>;

/**
 * The type for an external ID and source combined into a single string
 */
export const GroupSourceIdSourceValue = prepareExternalIdSourceValueRuntype(
  GroupSourceId,
  Source
);

export type GroupSourceIdSourceValue = Static<typeof GroupSourceIdSourceValue>;
