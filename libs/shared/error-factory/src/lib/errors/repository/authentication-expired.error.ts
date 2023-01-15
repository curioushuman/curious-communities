import { ErrorFactory, ErrorMessageComponents } from '../../error-factory';
import { RepositoryAuthenticationError } from './authentication.error';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'Auth session token has expired',
  action: 'Please refresh',
};

/**
 * Common domain error, issues authenticating with repo
 *
 * Error manifested as exception
 *
 * TODO
 * - [ ] can the messageComponents be folded in to the error?
 *       as a static method? Too verbose?
 */
export class RepositoryAuthenticationExpiredError extends RepositoryAuthenticationError {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
