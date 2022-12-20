import { InternalServerErrorException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'Invalid internal communication',
  action: 'Please review incoming request formats to this service',
};

/**
 * This is an error for communication breakdown between internal services
 * e.g. our Lambda has a contract of { id: string } and it is handed a { id: number }
 *
 * This is not a BadRequest from the client, it is in fact a Server Error
 */
export class InternalRequestInvalidError extends InternalServerErrorException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
