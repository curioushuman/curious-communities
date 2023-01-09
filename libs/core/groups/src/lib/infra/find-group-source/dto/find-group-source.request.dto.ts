import { Record, Static, String } from 'runtypes';

/**
 * This is based on a model that supports the creation of an internal
 * record from an external record based on (one of) several identifiers.
 * It so happens this object only has a single identifier, this is why it
 * looks slightly strange. Check out members for multi-identifier example.
 */

/**
 * DTO that accepts any of the identifiers
 */
export const FindGroupSourceRequestDto = Record({
  idSourceValue: String,
});

/**
 * DTO that accepts any of the identifiers
 */
export type FindGroupSourceRequestDto = Static<
  typeof FindGroupSourceRequestDto
>;

/**
 * DTO that accepts only the idSourceValue
 */
export const FindByIdSourceValueGroupSourceRequestDto = Record({
  idSourceValue: String,
});

/**
 * DTO that accepts only the idSourceValue
 */
export type FindByIdSourceValueGroupSourceRequestDto = Static<
  typeof FindByIdSourceValueGroupSourceRequestDto
>;
