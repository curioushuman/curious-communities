import { NotFoundException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'A matching item could not be found',
  action: 'Please check repository for requested record',
};

/**
 * Common domain error, when item cannot be found in local repo
 *
 * Error manifested as exception
 */
export class RepositoryItemNotFoundError extends NotFoundException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
