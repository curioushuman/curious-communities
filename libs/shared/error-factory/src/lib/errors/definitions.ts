import { UnknownError } from './unknown.error';
import { InternalRequestInvalidError } from './internal-request-invalid.error';
import { RequestInvalidError } from './request-invalid.error';
import { RepositoryItemConflictError } from './repository/item-conflict.error';
import { RepositoryItemUpdateError } from './repository/item-update.error';
import { SourceInvalidError } from './repository/source-invalid.error';
import { RepositoryAuthenticationError } from './repository/authentication.error';
import { RepositoryItemNotFoundError } from './repository/item-not-found.error';
import { RepositoryServerError } from './repository/server.error';
import { RepositoryServerUnavailableError } from './repository/server-unavailable.error';
import { NotYetImplementedError } from './not-yet-implemented.error';
import { NonMatchingSourceError } from './repository/non-matching-source.error';
import { RepositoryAuthenticationExpiredError } from './repository/authentication-expired.error';
import { ServiceError } from './services/service.error';
import { ServiceNotFoundError } from './services/service-not-found.error';

/**
 * ALL the errors
 *
 * * MUST INCLUDE all error definitions below
 *
 * NOTES
 * - they've been broken into sub groups for the purpose of API regex
 *   i.e. when we return an error via the API we won't return the actual error
 *   rather we'll return a more generic one. The groupings below relate to that
 *   grouping.
 */

export const clientErrors = {
  RequestInvalidError,
};

export const serverErrors = {
  InternalRequestInvalidError,
  NotYetImplementedError,
  NonMatchingSourceError,
  RepositoryAuthenticationError,
  RepositoryAuthenticationExpiredError,
  RepositoryItemConflictError,
  RepositoryItemUpdateError,
  RepositoryServerError,
  RepositoryServerUnavailableError,
  SourceInvalidError,
  ServiceNotFoundError,
  ServiceError,
  UnknownError,
};

export const notFoundErrors = {
  RepositoryItemNotFoundError,
};

export const allErrors = {
  ...clientErrors,
  ...serverErrors,
  ...notFoundErrors,
};
