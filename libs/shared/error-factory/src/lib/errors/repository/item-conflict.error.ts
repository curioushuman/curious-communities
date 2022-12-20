import { ConflictException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'Source already exists within our database',
  action: 'No action required',
};

/**
 * Common domain error, when item already exists in local repo
 *
 * Error manifested as exception
 * to be caught by Nest and returned
 * as HTTP exception
 */
export class RepositoryItemConflictError extends ConflictException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
