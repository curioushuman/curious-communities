import { InternalServerErrorException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'Source repository does not match request',
  action: 'Please confirm source repository matches request',
};

/**
 * Common domain error, when item returned from source is invalid
 *
 * Error manifested as exception
 * to be caught by Nest and returned
 * as HTTP exception
 */
export class NonMatchingSourceError extends InternalServerErrorException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
