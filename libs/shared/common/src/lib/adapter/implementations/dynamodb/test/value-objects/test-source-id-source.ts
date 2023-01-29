import { Static } from 'runtypes';

import {
  prepareExternalIdSourceRuntype,
  prepareExternalIdSourceValueRuntype,
} from '../../../../../domain/value-objects/external-id-source';
import { TestSourceId } from './test-source-id';
import { TestSource } from './test-source';

/**
 * This overrides the base structure for external ID + source
 *
 * NOTE: You have the option of overriding anywhere from none to all
 */
export const TestSourceIdSource = prepareExternalIdSourceRuntype(
  TestSourceId,
  TestSource
);

export type TestSourceIdSource = Static<typeof TestSourceIdSource>;

/**
 * The type for an external ID and source combined into a single string
 */
export const TestSourceIdSourceValue = prepareExternalIdSourceValueRuntype(
  TestSourceId,
  TestSource
);

export type TestSourceIdSourceValue = Static<typeof TestSourceIdSourceValue>;
