import { Injectable } from '@nestjs/common';
import { RepositoryErrorFactory } from '@curioushuman/error-factory';

/**
 * Factory to interpret and produce consistent errors from Auth0.
 *
 * Seems to be bog standard HTTP errors.
 */

export interface Auth0ApiRepositoryError extends Error {
  statusCode: number;
  error: string;
  message: string;
}

@Injectable()
export class Auth0ApiRepositoryErrorFactory extends RepositoryErrorFactory {
  /**
   * Return the status code based on the AWS DDB exception
   */
  public errorStatusCode(error: Auth0ApiRepositoryError): number {
    return error?.statusCode || 500;
  }

  /**
   * Abstract function we need to include to be able to return a
   * consistent error message from Salesforce.
   */
  public errorDescription(error: Auth0ApiRepositoryError): string {
    return error?.message || 'Unknown Auth0 error';
  }
}
