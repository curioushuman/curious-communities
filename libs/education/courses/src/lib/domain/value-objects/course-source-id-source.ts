import { Static } from 'runtypes';

import {
  prepareExternalIdSourceRuntype,
  prepareExternalIdSourceValueRuntype,
} from '@curioushuman/common';

import { CourseSourceId } from './course-source-id';
import { Source } from './source';

/**
 * This overrides the base structure for external ID + source
 *
 * NOTE: You have the option of overriding anywhere from none to all
 */
export const CourseSourceIdSource = prepareExternalIdSourceRuntype(
  CourseSourceId,
  Source
);

export type CourseSourceIdSource = Static<typeof CourseSourceIdSource>;

/**
 * The type for an external ID and source combined into a single string
 */
export const CourseSourceIdSourceValue = prepareExternalIdSourceValueRuntype(
  CourseSourceId,
  Source
);

export type CourseSourceIdSourceValue = Static<
  typeof CourseSourceIdSourceValue
>;
