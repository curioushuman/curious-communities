import { ConflictException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'Source does not require update',
  action: 'No action required',
};

/**
 * Common domain error, when item in repo matches source
 *
 * Error manifested as exception
 * to be caught by Nest and returned
 * as HTTP exception
 */
export class RepositoryItemUpdateError extends ConflictException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
