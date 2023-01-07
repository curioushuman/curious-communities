import { Optional, Record, Static, String } from 'runtypes';

/**
 * Externally facing DTO for find function
 *
 * This is a tricky one... There is an unanswered question RE how to handle
 * (the e.g. of) a user requesting a member-source by email and wanting to
 * define a source for this. I can't currently think of any use cases so we're
 * not going to bake it in, hoping it doesn't bite us later.
 */

/**
 * DTO that accepts any of the identifiers
 */
export const FindMemberSourceRequestDto = Record({
  idSourceValue: Optional(String),
  email: Optional(String),
}).withConstraint((dto) => !!(dto.idSourceValue || dto.email));

/**
 * DTO that accepts any of the identifiers
 */
export type FindMemberSourceRequestDto = Static<
  typeof FindMemberSourceRequestDto
>;

/**
 * DTO that accepts only the idSourceValue
 */
export const FindByIdSourceValueMemberSourceRequestDto = Record({
  idSourceValue: String,
});

/**
 * DTO that accepts only the idSourceValue
 */
export type FindByIdSourceValueMemberSourceRequestDto = Static<
  typeof FindByIdSourceValueMemberSourceRequestDto
>;

/**
 * DTO that accepts only the email
 */
export const FindByEmailMemberSourceRequestDto = Record({
  email: String,
});

/**
 * DTO that accepts only the email
 */
export type FindByEmailMemberSourceRequestDto = Static<
  typeof FindByEmailMemberSourceRequestDto
>;
