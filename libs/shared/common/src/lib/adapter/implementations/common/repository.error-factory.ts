import { Injectable } from '@nestjs/common';
import { RepositoryErrorFactory } from '@curioushuman/error-factory';
import { BasicHttpRepositoryError } from './repository.error-factory.types';

/**
 * Factory to interpret and produce consistent errors from EdApp.
 *
 * Seems to be bog standard HTTP errors.
 */
@Injectable()
export class BasicRepositoryErrorFactory<
  E extends BasicHttpRepositoryError
> extends RepositoryErrorFactory {
  /**
   * Return the status code based on the AWS DDB exception
   */
  public errorStatusCode(error: E): number {
    return error?.statusCode || 500;
  }

  /**
   * Abstract function we need to include to be able to return a
   * consistent error message from Salesforce.
   */
  public errorDescription(error: E): string {
    return error?.message || 'Unknown EdApp error';
  }
}
