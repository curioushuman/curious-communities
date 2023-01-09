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
export const CreateGroupRequestDto = Record({
  idSourceValue: String,
});

/**
 * DTO that accepts any of the identifiers
 */
export type CreateGroupRequestDto = Static<typeof CreateGroupRequestDto>;

/**
 * DTO that accepts only the idSourceValue
 */
export const CreateByIdSourceValueGroupRequestDto = Record({
  idSourceValue: String,
});

/**
 * DTO that accepts only the idSourceValue
 */
export type CreateByIdSourceValueGroupRequestDto = Static<
  typeof CreateByIdSourceValueGroupRequestDto
>;
