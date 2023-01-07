import { Optional, Record, Static, String } from 'runtypes';

/**
 * * Decisions
 *
 * At this point I'm going to keep this layer simple. We'll have different DTO
 * for the different use cases. This will allow us to keep the DTOs simple.
 *
 * At some later point it might be worth considering a more generic DTO that
 * can be used for all use cases. This would require some more thought and
 * consideration.
 */

/**
 * Externally facing DTO for find function
 *
 * NOTE: this has been updated to accept strings. As this is the external
 * facing DTO, this will be OK. We then need to validate as we proceed
 * further into application layers.
 */

/**
 * DTO that accepts any of the identifiers
 */
export const FindMemberRequestDto = Record({
  id: Optional(String),
  idSourceValue: Optional(String),
  email: Optional(String),
}).withConstraint((dto) => !!(dto.id || dto.idSourceValue || dto.email));

/**
 * DTO that accepts any of the identifiers
 */
export type FindMemberRequestDto = Static<typeof FindMemberRequestDto>;

/**
 * DTO that accepts only the id
 */
export const FindByIdMemberRequestDto = Record({
  id: String,
});

/**
 * DTO that accepts only the id
 */
export type FindByIdMemberRequestDto = Static<typeof FindByIdMemberRequestDto>;

/**
 * DTO that accepts only the idSourceValue
 */
export const FindByIdSourceValueMemberRequestDto = Record({
  idSourceValue: String,
});

/**
 * DTO that accepts only the idSourceValue
 */
export type FindByIdSourceValueMemberRequestDto = Static<
  typeof FindByIdSourceValueMemberRequestDto
>;

/**
 * DTO that accepts only the email
 */
export const FindByEmailMemberRequestDto = Record({
  email: String,
});

/**
 * DTO that accepts only the email
 */
export type FindByEmailMemberRequestDto = Static<
  typeof FindByEmailMemberRequestDto
>;
