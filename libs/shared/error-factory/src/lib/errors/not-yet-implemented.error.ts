import { NotImplementedException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'This particular feature does not yet exist, but is on our roadmap',
  action: 'Please check back in a short while',
};

/**
 * Common domain error
 * Occurs when use requests a service that is on our roadmap
 * Error manifested as exception
 * to be caught by Nest and returned
 * as HTTP exception
 */
export class NotYetImplementedError extends NotImplementedException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
