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

/**
 * Function to convert an external ID and source value into an object
 *
 * ? Should I declare the return type here?
 */
export function prepareExternalIdSource(
  idSourceValue: string,
  externalIdRuntype?: Runtype<string>,
  externalSourceRuntype?: Runtype<string>
) {
  const [source, id] = idSourceValue.split(EXTERNAL_ID_SOURCE_SEPARATOR);
  const idType = externalIdRuntype || ExternalId;
  const sourceType = externalSourceRuntype || ExternalSource;
  return {
    id: idType.check(id),
    source: sourceType.check(source),
  };
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
  const [source, id] = idSourceValue.split(EXTERNAL_ID_SOURCE_SEPARATOR);
  const idType = externalIdRuntype || ExternalId;
  const sourceType = externalSourceRuntype || ExternalSource;
  return prepareExternalIdSourceValue(
    idType.check(id),
    sourceType.check(source)
  );
}
