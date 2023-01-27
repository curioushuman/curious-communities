import { DynamoDBServiceException } from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { RepositoryErrorFactory } from '@curioushuman/error-factory';

/**
 * Factory to interpret and produce consistent errors from ASW DynamoDB.
 *
 * References
 * - https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html
 * - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/dynamodbserviceexception.html#message
 */

@Injectable()
export class DynamoDbRepositoryErrorFactory extends RepositoryErrorFactory {
  /**
   * Return the status code based on the AWS DDB exception
   */
  public errorStatusCode(error: DynamoDBServiceException): number {
    return error?.$response?.statusCode || 500;
  }

  /**
   * Abstract function we need to include to be able to return a
   * consistent error message from Salesforce.
   */
  public errorDescription(error: DynamoDBServiceException): string {
    return error?.message || 'Unknown AWS error';
  }
}
