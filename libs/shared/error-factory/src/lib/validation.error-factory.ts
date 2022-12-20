import { Injectable } from '@nestjs/common';

import { SourceInvalidError } from './errors/repository/source-invalid.error';
import { RequestInvalidError } from './errors/request-invalid.error';
import { ErrorFactory } from './error-factory';

const allowedErrors = {
  RequestInvalidError,
  SourceInvalidError,
};
export type ValidationAllowedErrorTypeName = keyof typeof allowedErrors;

const errorMap = {
  400: RequestInvalidError,
  500: SourceInvalidError,
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
    return error.toString();
  }
}
