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
export const CreateMemberRequestDto = Record({
  idSourceValue: Optional(String),
  email: Optional(String),
}).withConstraint((dto) => !!(dto.idSourceValue || dto.email));

/**
 * DTO that accepts any of the identifiers
 */
export type CreateMemberRequestDto = Static<typeof CreateMemberRequestDto>;

/**
 * DTO that accepts only the idSourceValue
 */
export const CreateByIdSourceValueMemberRequestDto = Record({
  idSourceValue: String,
});

/**
 * DTO that accepts only the idSourceValue
 */
export type CreateByIdSourceValueMemberRequestDto = Static<
  typeof CreateByIdSourceValueMemberRequestDto
>;

/**
 * DTO that accepts only the email
 */
export const CreateByEmailMemberRequestDto = Record({
  email: String,
});

/**
 * DTO that accepts only the email
 */
export type CreateByEmailMemberRequestDto = Static<
  typeof CreateByEmailMemberRequestDto
>;
