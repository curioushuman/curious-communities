import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { URLSearchParams } from 'url';

import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryAuthenticationError } from '@curioushuman/error-factory';
import { executeTask, logAction } from '@curioushuman/fp-ts-utils';
import { Auth0ApiRepositoryErrorFactory } from './repository.error-factory';
import { Auth0ApiAuthResponse } from './types/auth-response';
import { confirmEnvVars } from '../../../utils/functions';

/**
 * Setting up Authorization header and other HTTP config options
 *
 * NOTES
 * - using axios directly rather than HttpService
 *   - Even using common.forwardRef didn't seem to make it possible
 *   - https://docs.nestjs.com/fundamentals/circular-dependency
 *   - as axios is already installed, there is no harm in using it really
 *
 * TODO
 * - [ ] test whether or not the non-DI inclusion of errorFactory behaves as expected
 * - [ ] cache token
 */

@Injectable()
export class Auth0ApiHttpConfigService implements HttpModuleOptionsFactory {
  private logger: LoggableLogger;
  private errorFactory: Auth0ApiRepositoryErrorFactory;
  private authURL: string;
  private baseURL: string;

  constructor() {
    this.errorFactory = new Auth0ApiRepositoryErrorFactory();
    this.logger = new LoggableLogger(Auth0ApiHttpConfigService.name);
    const requiredEnvVars = ['AUTH0_DOMAIN'];
    confirmEnvVars(requiredEnvVars);
    this.authURL = `${process.env.AUTH0_DOMAIN}/oauth/token`;
    this.baseURL = `${process.env.AUTH0_DOMAIN}/api/v2/`;
  }

  /**
   * This adds these basic headers to all requests
   */
  async createHttpOptions(): Promise<HttpModuleOptions> {
    const token = await executeTask(this.token());
    this.logger.verbose(`BaseURL set: ${this.baseURL}`);
    this.logger.verbose(`Token received: ${token}`);
    return {
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  /**
   * TODO - Implement caching of token
   * Create a ternary or similar and look for cache first
   */
  private token(): TE.TaskEither<Error, string> {
    return pipe(
      this.getTokenFromSource(),
      logAction(
        this.logger,
        this.errorFactory,
        'Token retrieved',
        'Token retrieval failed'
      )
    );
  }

  /**
   * Things that need to be done with/based on the response
   */
  private processAuthResponse(response: Auth0ApiAuthResponse): string {
    if (response.access_token === undefined) {
      // this will be caught (below), and passed through ErrorFactory
      throw new RepositoryAuthenticationError('No access token received');
    }
    this.logger.debug(response);
    return response.access_token;
  }

  /**
   * Makes the auth request
   */
  private getTokenFromSource(): TE.TaskEither<Error, string> {
    return TE.tryCatch(
      async () => {
        const requiredEnvVars = ['AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET'];
        confirmEnvVars(requiredEnvVars);
        // type casting as we have checked these above
        const body = new URLSearchParams({
          client_id: process.env.AUTH0_CLIENT_ID as string,
          client_secret: process.env.AUTH0_CLIENT_SECRET as string,
          audience: this.baseURL,
          grant_type: 'client_credentials',
        });
        const response = await axios.post<Auth0ApiAuthResponse>(
          this.authURL,
          body
        );
        this.logger.debug(response.data);
        if (!response.data) {
          throw new RepositoryAuthenticationError('No response received');
        }
        return this.processAuthResponse(response.data);
      },
      (error: Error) =>
        this.errorFactory.error(error, 'RepositoryAuthenticationError')
    );
  }

  /**
   * Breaks the auth request (for testing)
   */
  public testBreakAuth(): void {
    this.authURL = `${process.env.AUTH0_DOMAIN}/something/completely/wrong`;
  }

  /**
   * Supposed to test a broken connection
   *
   * TODO: get working
   */
  public testBreakConnection(): void {
    this.baseURL = `http://not-auth0-at-ll.com.au/v1000/`;
  }
}
