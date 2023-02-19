import { Literal, Static, Union } from 'runtypes';

export const REQUEST_SOURCE_INTERNAL = 'internal';
export const REQUEST_SOURCE_EXTERNAL = 'internal';

/**
 * DTO that accepts any of the identifiers
 */
export const RequestSource = Union(
  Literal(REQUEST_SOURCE_INTERNAL),
  Literal(REQUEST_SOURCE_EXTERNAL)
);

/**
 * DTO that accepts any of the identifiers
 */
export type RequestSource = Static<typeof RequestSource>;
