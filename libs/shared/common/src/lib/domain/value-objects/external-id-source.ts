import { NonMatchingSourceError } from '@curioushuman/error-factory';
import { Record, Runtype, Static, Template } from 'runtypes';
import { ExternalId } from './external-id';
import { ExternalSource } from './external-source';

const EXTERNAL_ID_SOURCE_SEPARATOR = '#';

/**
 * A function to build an ExternalIdSource type or derivative
 */
export function prepareExternalIdSourceRuntype(
  externalIdRuntype?: Runtype<string>,
  externalSourceRuntype?: Runtype<string>
) {
  return Record({
    id: externalIdRuntype || ExternalId,
    source: externalSourceRuntype || ExternalSource,
  });
}

export const ExternalIdSource = prepareExternalIdSourceRuntype();

export type ExternalIdSource = Static<typeof ExternalIdSource>;

/**
 * A function to build an ExternalIdSourceValue type or derivative
 */
export function prepareExternalIdSourceValueRuntype(
  externalIdRuntype?: Runtype<string>,
  externalSourceRuntype?: Runtype<string>
) {
  const idType = externalIdRuntype || ExternalId;
  const sourceType = externalSourceRuntype || ExternalSource;
  return Template(
    Template(sourceType),
    EXTERNAL_ID_SOURCE_SEPARATOR,
    Template(idType)
  );
}

/**
 * The type for an external ID and source combined into a single string
 */
export const ExternalIdSourceValue = prepareExternalIdSourceValueRuntype();

export type ExternalIdSourceValue = Static<typeof ExternalIdSourceValue>;

/**
 * Function to convert an external ID and source into a single string for
 * handing off to the database.
 *
 * NOTE: we're using strings as inputs to keep this function as generic and re-usable
 * as possible. All type checking should be handled elsewhere, so this function only needs
 * to deal with the form of the final IdSourceValue string.
 */
export function prepareExternalIdSourceValue(
  id: string,
  source: string
): ExternalIdSourceValue {
  return `${source}${EXTERNAL_ID_SOURCE_SEPARATOR}${id}`;
}

export function processExternalIdSourceValue(idSourceValue: string) {
  const [source, id] = idSourceValue.split(EXTERNAL_ID_SOURCE_SEPARATOR);
  return {
    id,
    source,
  };
}

export function guardExternalIdSourceValue(
  idSourceValue: string,
  sources: string[]
) {
  const { source, id } = processExternalIdSourceValue(idSourceValue);
  return !!id && !!source && sources.includes(source);
}

/**
 * Function to convert an external ID and source into a single string for
 * handing off to the database.
 */
export function parseExternalIdSourceValue(
  idSourceValue: string,
  externalIdRuntype?: Runtype<string>,
  externalSourceRuntype?: Runtype<string>
): ExternalIdSourceValue {
  const { source, id } = processExternalIdSourceValue(idSourceValue);
  const idType = externalIdRuntype || ExternalId;
  const sourceType = externalSourceRuntype || ExternalSource;
  return prepareExternalIdSourceValue(
    idType.check(id),
    sourceType.check(source)
  );
}

/**
 * Function to convert an external ID and source value into an object
 *
 * TODO
 * - [ ] modify this to be a generic function
 */
export function prepareExternalIdSource(
  idSourceValue: string,
  externalIdRuntype?: Runtype<string>,
  externalSourceRuntype?: Runtype<string>
) {
  const { source, id } = processExternalIdSourceValue(idSourceValue);
  const idType = externalIdRuntype || ExternalId;
  const sourceType = externalSourceRuntype || ExternalSource;
  return {
    id: idType.check(id),
    source: sourceType.check(source),
  };
}

/**
 * A type used solely for these helper functions
 */
export type SourceOfSourceId<SID extends ExternalIdSource> = SID['source'];
export type IdOfSourceId<SID extends ExternalIdSource> = SID['id'];

/**
 * Helper function to find the sourceId object for a given source
 */
export function findSourceId<SID extends ExternalIdSource>(
  sourceIds: SID[],
  source: SourceOfSourceId<SID>
): SID | undefined {
  return sourceIds.find((sourceId) => sourceId.source === source);
}

/**
 * Helper function to find the sourceId object for a given source
 * and return the id value
 */
export function findSourceIdAsValue<SID extends ExternalIdSource>(
  sourceIds: SID[],
  source: SourceOfSourceId<SID>
): ExternalIdSourceValue | undefined {
  const sourceId = sourceIds.find((sourceId) => sourceId.source === source);
  return sourceId
    ? prepareExternalIdSourceValue(sourceId.id, sourceId.source)
    : undefined;
}

/**
 * Helper function to find the sourceIdValue for a given source
 */
export function findSourceIdValue(
  sourceIdValues: string[],
  sourceString: string
): string | undefined {
  return sourceIdValues.find(
    (sourceIdValue) => sourceIdValue.indexOf(sourceString) > -1
  );
}

/**
 * Helper function to confirm the correct source, and return the id value
 *
 * If incorrect source, throw an error
 */
export function confirmSourceId<SID extends ExternalIdSource>(
  sourceId: SID,
  source: SourceOfSourceId<SID>
): IdOfSourceId<SID> {
  if (sourceId.source !== source) {
    throw new NonMatchingSourceError();
  }
  return sourceId.id as IdOfSourceId<SID>;
}
