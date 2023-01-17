import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as jwt from 'jsonwebtoken';
import { pipe } from 'fp-ts/lib/function';
import { URLSearchParams } from 'url';
import { readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';

import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryAuthenticationError } from '@curioushuman/error-factory';
import { executeTask, logAction } from '@curioushuman/fp-ts-utils';
import {
  SalesforceApiRepositoryError,
  SalesforceApiRepositoryErrorFactory,
} from './repository.error-factory';
import { SalesforceApiAuthResponse } from './types/auth-response';

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
export class SalesforceApiHttpConfigService
  implements HttpModuleOptionsFactory
{
  private logger: LoggableLogger;
  private errorFactory: SalesforceApiRepositoryErrorFactory;
  private authURL: string;
  private baseURL: string;

  /**
   * This is a little function to confirm the env vars we need
   * out of the gates. We check for other ones in context for
   * better error reporting.
   */
  private confirmEnvVars(requiredVars: string[]): void {
    requiredVars.forEach((envVar) => {
      if (!process.env[envVar]) {
        throw new Error(`Missing environment variable ${envVar}`);
      }
    });
  }

  constructor() {
    this.errorFactory = new SalesforceApiRepositoryErrorFactory();
    this.logger = new LoggableLogger(SalesforceApiHttpConfigService.name);
    const requiredEnvVars = ['SALESFORCE_URL_AUTH'];
    this.confirmEnvVars(requiredEnvVars);
    this.authURL = `${process.env.SALESFORCE_URL_AUTH}/services/oauth2/token`;
    this.baseURL = this.prepareBaseUrl();
  }

  /**
   * Added this function so we can dynamically set the base URL
   * from the auth response (if instance_url is returned)
   */
  private prepareBaseUrl(baseUrl?: string): string {
    const url = baseUrl || process.env.SALESFORCE_URL_DATA;
    if (!url) {
      throw new Error(
        `Missing Base Url for ${SalesforceApiHttpConfigService.name}`
      );
    }
    const requiredEnvVars = ['SALESFORCE_URL_DATA_VERSION'];
    this.confirmEnvVars(requiredEnvVars);
    return `${url}/services/data/v${process.env.SALESFORCE_URL_DATA_VERSION}/`;
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
  private processAuthResponse(response: SalesforceApiAuthResponse): string {
    if (response.access_token === undefined) {
      // this will be caught (below), and passed through ErrorFactory
      throw new RepositoryAuthenticationError('No access token received');
    }
    // if instance url returned, use this for baseUrl
    if (response.instance_url) {
      this.baseURL = this.prepareBaseUrl(response.instance_url);
    }
    this.logger.debug(response);
    return response.access_token;
  }

  /**
   * Specific JWT preparation for this API
   */
  private prepareJwt(): string {
    const keyPath = pathResolve(
      __dirname,
      '../../../../../../../../env/jwtRS256.key'
    );
    const privateKey = readFileSync(keyPath);
    // NOTE: auth URL already confirmed in constructor
    const requiredEnvVars = ['SALESFORCE_CONSUMER_KEY', 'SALESFORCE_USER'];
    this.confirmEnvVars(requiredEnvVars);
    return jwt.sign(
      {
        iss: process.env.SALESFORCE_CONSUMER_KEY,
        sub: process.env.SALESFORCE_USER,
        aud: process.env.SALESFORCE_URL_AUTH,
      },
      privateKey,
      {
        algorithm: 'RS256',
        // * NOTE: without expiry, this token will be invalid
        expiresIn: '365d',
        header: {
          alg: 'RS256',
          typ: 'JWT',
        },
      }
    );
  }

  /**
   * Makes the auth request
   */
  private getTokenFromSource(): TE.TaskEither<Error, string> {
    return TE.tryCatch(
      async () => {
        const body = new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: this.prepareJwt(),
        });
        const response = await axios.post<SalesforceApiAuthResponse>(
          this.authURL,
          body
        );
        this.logger.debug(response.data);
        if (!response.data) {
          throw new RepositoryAuthenticationError('No response received');
        }
        return this.processAuthResponse(response.data);
      },
      (error: SalesforceApiRepositoryError) =>
        this.errorFactory.error(error, 'RepositoryAuthenticationError')
    );
  }

  /**
   * Breaks the auth request (for testing)
   */
  public testBreakAuth(): void {
    this.authURL = `${process.env.SALESFORCE_URL_AUTH}/something/completely/wrong`;
  }

  /**
   * Supposed to test a broken connection
   *
   * TODO: get working
   */
  public testBreakConnection(): void {
    this.baseURL = `http://not-salesforce-at-ll.com.au/v1000/`;
  }
}
