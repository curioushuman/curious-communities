import { UnauthorizedException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'Error authenticating at repository',
  action: 'Please re-authenticate',
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
export class RepositoryAuthenticationError extends UnauthorizedException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
