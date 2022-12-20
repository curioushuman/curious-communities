import { BadRequestException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'Invalid request',
  action: 'Please review',
};

/**
 * Common domain error
 * Occurs when request from use is invalid
 * Error manifested as exception
 * to be caught by Nest and returned
 * as HTTP exception
 */
export class RequestInvalidError extends BadRequestException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
