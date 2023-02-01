import { Injectable } from '@nestjs/common';
import { RepositoryErrorFactory } from '@curioushuman/error-factory';
import {
  SalesforceApiRepositoryError,
  SalesforceApiRepositoryErrorDataArray,
  SalesforceApiRepositoryErrorDataObject,
  SalesforceApiRepositoryErrorOrArray,
  SalesforceApiRepositoryErrorResponse,
} from './repository.error-factory.types';

/**
 * Factory to interpret and produce consistent errors from the riddled mess
 * that is returned from Salesforce. Two types of individual error, or maybe
 * even an array of errors.
 */
@Injectable()
export class SalesforceApiRepositoryErrorFactory extends RepositoryErrorFactory {
  private sfErrorCodes: Record<string, number> = {
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  };

  /**
   * Abstract function we need to include to allow our error factory
   * to interpret the errors returned from Salesforce.
   */
  public errorStatusCode(
    errorOrArray: SalesforceApiRepositoryErrorOrArray
  ): number {
    return Array.isArray(errorOrArray)
      ? this.errorStatusCodeFromArray(errorOrArray)
      : this.errorStatusCodeFromSalesforceError(errorOrArray);
  }

  private errorStatusCodeFromSalesforceError(
    error: SalesforceApiRepositoryError
  ): number {
    return error.response === undefined ? 500 : error.response.status;
  }

  private errorStatusCodeFromArray(
    errorArray: SalesforceApiRepositoryErrorDataArray
  ): number {
    const errCode =
      errorArray[0].errorCode === undefined
        ? 'SERVER_ERROR'
        : errorArray[0].errorCode;
    return this.sfErrorCodes[errCode] ?? 500;
  }

  /**
   * Abstract function we need to include to be able to return a
   * consistent error message from Salesforce.
   */
  public errorDescription(
    errorOrArray: SalesforceApiRepositoryErrorOrArray
  ): string {
    return Array.isArray(errorOrArray)
      ? this.errorDescriptionFromArray(errorOrArray)
      : this.errorDescriptionFromSalesforceError(errorOrArray);
  }

  private errorDescriptionFromArray(
    errorArray: SalesforceApiRepositoryErrorDataArray
  ): string {
    return errorArray[0].message ?? 'unknown error';
  }

  private errorDescriptionFromSalesforceError(
    error: SalesforceApiRepositoryError
  ): string {
    return error.response === undefined
      ? error.message
      : this.errorDescriptionFromData(error.response);
  }

  private errorDescriptionFromData(
    errorResponse: SalesforceApiRepositoryErrorResponse
  ): string {
    const description = Array.isArray(errorResponse.data)
      ? errorResponse.data?.map((d) => d.message).join('\n')
      : errorResponse.data?.error_description;
    return description ?? 'unknown error';
  }

  public static prepareError(
    errorData: SalesforceApiRepositoryErrorDataObject
  ): SalesforceApiRepositoryError {
    const response: SalesforceApiRepositoryErrorResponse = {
      status: 500,
      statusText: errorData.error_description ?? 'Error reaching Salesforce',
      data: errorData,
    };
    return {
      name: 'SalesforceApiRepositoryError',
      response,
      message: response.statusText,
    };
  }
}
