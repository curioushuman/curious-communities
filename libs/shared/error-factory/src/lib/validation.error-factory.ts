import { Injectable } from '@nestjs/common';

import { ErrorFactory } from './error-factory';
import { InternalRequestInvalidError } from './errors/internal-request-invalid.error';
import { RequestInvalidError } from './errors/request-invalid.error';
import { SourceInvalidError } from './errors/repository/source-invalid.error';

const allowedErrors = {
  RequestInvalidError,
  SourceInvalidError,
  InternalRequestInvalidError,
};
export type ValidationAllowedErrorTypeName = keyof typeof allowedErrors;

const errorMap = {
  400: RequestInvalidError,
  500: InternalRequestInvalidError,
};

@Injectable()
export class ValidationErrorFactory extends ErrorFactory<ValidationAllowedErrorTypeName> {
  constructor() {
    super(errorMap);
  }

  // we don't need the error status for this type of error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public errorStatusCode(_: Error): number {
    return 400;
  }

  public errorDescription(error: Error): string {
    if ('toString' in error) {
      return error.toString();
    }
    return 'Unknown validation error';
  }
}
