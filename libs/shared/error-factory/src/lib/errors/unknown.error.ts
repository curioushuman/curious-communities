import { InternalServerErrorException } from '@nestjs/common';

import { ErrorFactory, ErrorMessageComponents } from '../error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'Something unexpected happened',
  action: 'DO NOT PANIC, out talented team are hunting it down as we speak',
};

/**
 * Unknown exception
 * Calling it out as unknown so we can track them,
 * and know them.
 */
export class UnknownError extends InternalServerErrorException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
