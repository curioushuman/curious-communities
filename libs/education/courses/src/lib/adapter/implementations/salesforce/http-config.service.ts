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
import {
  RepositoryAuthenticationError,
  RepositoryAuthenticationExpiredError,
} from '@curioushuman/error-factory';
import { executeTask, logAction } from '@curioushuman/fp-ts-utils';
import { SalesforceApiRepositoryErrorFactory } from './repository.error-factory';
import { SalesforceApiAuthResponse } from './types/auth-response';
import { CourseSourceRepositoryErrorFactory } from '../../ports/course-source.repository.error-factory';

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
  private errorFactory: CourseSourceRepositoryErrorFactory;
  private authURL: string;
  private tokenURL: string;
  private baseURL: string;
  private sessionTimeoutMinutes = 30;
  private refreshToken = '';

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
    const requiredEnvVars = [
      'SALESFORCE_URL_AUTH',
      'SALESFORCE_URL_DATA',
      'SALESFORCE_URL_DATA_VERSION',
    ];
    this.confirmEnvVars(requiredEnvVars);
    this.authURL = `${process.env.SALESFORCE_URL_AUTH}/services/oauth2/token`;
    this.tokenURL = `${process.env.SALESFORCE_URL_AUTH}/services/oauth2/token`;
    this.baseURL = `${process.env.SALESFORCE_URL_DATA}/services/data/v${process.env.SALESFORCE_URL_DATA_VERSION}/`;
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
      // if expired, try and refresh
      TE.orElse((err) => {
        return err instanceof RepositoryAuthenticationExpiredError
          ? this.refreshTokenFromSource()
          : TE.left(err);
      }),
      logAction(
        this.logger,
        this.errorFactory,
        'Token retrieved',
        'Token retrieval failed'
      )
    );
  }

  private hasTokenExpired(issuedAt: number): boolean {
    const sessionTimeInMilliseconds = this.sessionTimeoutMinutes * 60 * 1000;
    return issuedAt + sessionTimeInMilliseconds < Date.now();
  }

  private processAuthResponse(response: SalesforceApiAuthResponse): string {
    if (response.access_token === undefined) {
      // this will be caught (below), and passed through ErrorFactory
      throw new RepositoryAuthenticationError('No access token received');
    }
    this.logger.debug(response);
    if (this.hasTokenExpired(response.issued_at)) {
      this.refreshToken = response.refresh_token;
      throw new RepositoryAuthenticationExpiredError(
        `Token older than ${this.sessionTimeoutMinutes} minutes}`
      );
    }
    return response.access_token;
  }

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
      (error: Error) =>
        this.errorFactory.error(error, 'RepositoryAuthenticationError')
    );
  }

  private refreshTokenFromSource(): TE.TaskEither<Error, string> {
    return TE.tryCatch(
      async () => {
        this.confirmEnvVars(['SALESFORCE_CONSUMER_KEY']);
        const body = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          // confirmed above
          client_id: process.env.SALESFORCE_CONSUMER_KEY as string,
        });
        const response = await axios.post<SalesforceApiAuthResponse>(
          this.tokenURL,
          body
        );
        if (!response.data) {
          throw new RepositoryAuthenticationError('No response received');
        }
        return this.processAuthResponse(response.data);
      },
      (error: Error) =>
        this.errorFactory.error(error, 'RepositoryAuthenticationError')
    );
  }

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
        expiresIn: '1h',
        header: {
          alg: 'RS256',
          typ: 'JWT',
        },
      }
    );
  }

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
