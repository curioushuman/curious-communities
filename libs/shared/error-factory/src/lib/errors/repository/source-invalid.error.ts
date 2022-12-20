import { InternalServerErrorException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'Source contains insufficient or invalid data',
  action: 'Please review requested record at source',
};

/**
 * Common domain error, when item returned from source is invalid
 *
 * Error manifested as exception
 * to be caught by Nest and returned
 * as HTTP exception
 */
export class SourceInvalidError extends InternalServerErrorException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
