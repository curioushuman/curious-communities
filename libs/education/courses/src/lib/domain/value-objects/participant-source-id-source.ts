import { Static } from 'runtypes';

import {
  prepareExternalIdSourceRuntype,
  prepareExternalIdSourceValueRuntype,
} from '@curioushuman/common';

import { ParticipantSourceId } from './participant-source-id';
import { Source } from './source';

/**
 * This overrides the base structure for external ID + source
 *
 * NOTE: You have the option of overriding anywhere from none to all
 */
export const ParticipantSourceIdSource = prepareExternalIdSourceRuntype(
  ParticipantSourceId,
  Source
);

export type ParticipantSourceIdSource = Static<
  typeof ParticipantSourceIdSource
>;

/**
 * The type for an external ID and source combined into a single string
 */
export const ParticipantSourceIdSourceValue =
  prepareExternalIdSourceValueRuntype(ParticipantSourceId, Source);

export type ParticipantSourceIdSourceValue = Static<
  typeof ParticipantSourceIdSourceValue
>;
