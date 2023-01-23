import { RepositoryErrorFactory } from '@curioushuman/error-factory';
import { Injectable } from '@nestjs/common';

/**
 * Factory to interpret and produce consistent errors from the riddled mess
 * that is returned from Salesforce. Two types of individual error, or maybe
 * even an array of errors.
 */

@Injectable()
export class DynamoDbRepositoryErrorFactory extends RepositoryErrorFactory {
  private dynamoDbErrorCodes: Record<string, number> = {
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  };

  /**
   * Abstract function we need to include to allow our error factory
   * to interpret the errors returned from Salesforce.
   */
  public errorStatusCode(error: Error): number {
    return 400;
  }

  /**
   * Abstract function we need to include to be able to return a
   * consistent error message from Salesforce.
   */
  public errorDescription(error: Error): string {
    return 'Temporary error message';
  }
}
