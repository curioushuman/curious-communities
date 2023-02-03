import { InternalServerErrorException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'A matching service could not be found',
  action: 'Please review application code',
};

/**
 * Common domain error, when item cannot be found in local repo
 *
 * Error manifested as exception
 */
export class ServiceNotFoundError extends InternalServerErrorException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
