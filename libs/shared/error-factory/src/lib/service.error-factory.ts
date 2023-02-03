import { Injectable } from '@nestjs/common';
import { ValidationError } from 'runtypes';

import { ErrorFactory } from './error-factory';
import { ServiceNotFoundError } from './errors/services/service-not-found.error';
import { ServiceError } from './errors/services/service.error';
import { SourceInvalidError } from './errors/repository/source-invalid.error';

const allowedErrors = {
  ServiceError,
  ServiceNotFoundError,
  SourceInvalidError,
};
export type ServiceAllowedErrorTypeName = keyof typeof allowedErrors;

const errorMap = {
  400: ServiceError,
  404: ServiceNotFoundError,
  500: ServiceError,
};

@Injectable()
export abstract class ServiceErrorFactory extends ErrorFactory<ServiceAllowedErrorTypeName> {
  constructor() {
    super(errorMap);
  }

  /**
   * We ask our repositories to return a valid Type
   * Validation errors are not repository specific
   * Anything that is returned from any repository
   * that is invalid should return a SourceInvalidError
   */
  private isValidationError(error: Error): boolean {
    return error instanceof ValidationError;
  }

  /**
   * We override the main error function to catch ValidationErrors
   * in this repository context.
   */
  public override error(
    error: Error,
    asErrorType?: ServiceAllowedErrorTypeName
  ): Error {
    return this.isValidationError(error)
      ? super.error(error, 'SourceInvalidError')
      : super.error(error, asErrorType);
  }
}
