import { Injectable } from '@nestjs/common';
import { RepositoryErrorFactory } from '@curioushuman/error-factory';
import { BettermodeApiRepositoryError } from './__types__';

/**
 * Factory to interpret and produce consistent errors from EdApp.
 *
 * Seems to be bog standard HTTP errors.
 */
@Injectable()
export class BettermodeApiRepositoryErrorFactory extends RepositoryErrorFactory {
  /**
   * Return the status code based on the AWS DDB exception
   */
  public errorStatusCode(error: BettermodeApiRepositoryError): number {
    return error?.status || 500;
  }

  /**
   * Abstract function we need to include to be able to return a
   * consistent error message from Salesforce.
   */
  public errorDescription(error: BettermodeApiRepositoryError): string {
    return error?.message || 'Unknown Bettermode error';
  }
}
