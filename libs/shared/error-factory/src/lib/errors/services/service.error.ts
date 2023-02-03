import { InternalServerErrorException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'Error in service',
  action: 'Please try again or contact system administrator',
};

/**
 * Common domain error, issues accessing repo
 *
 * Error manifested as exception
 */
export class ServiceError extends InternalServerErrorException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
