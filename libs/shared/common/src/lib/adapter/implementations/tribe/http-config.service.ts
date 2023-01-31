import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import axios, { AxiosError } from 'axios';
import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryAuthenticationError } from '@curioushuman/error-factory';
import { executeTask, logAction } from '@curioushuman/fp-ts-utils';
import { TribeApiRepositoryErrorFactory } from './repository.error-factory';
import { confirmEnvVars } from '../../../utils/functions';
import {
  TribeApiAuthResponse,
  TribeApiAuthResponseAxios,
} from './types/auth-response';
import { URLSearchParams } from 'url';

/**
 * Setting up Authorization header and other HTTP config options
 *
 * NOTES:
 * - this is now legacy according to Bettermode, can't even find docs
 *
 * TODO
 * - [ ] cache token
 */

@Injectable()
export class TribeApiHttpConfigService implements HttpModuleOptionsFactory {
  private logger: LoggableLogger;
  private errorFactory: TribeApiRepositoryErrorFactory;
  private authURL: string;
  private baseURL: string;

  constructor() {
    this.errorFactory = new TribeApiRepositoryErrorFactory();
    this.logger = new LoggableLogger(TribeApiHttpConfigService.name);
    const requiredEnvVars = ['TRIBE_DOMAIN'];
    confirmEnvVars(requiredEnvVars);
    this.authURL = `${process.env.TRIBE_DOMAIN}/api/v1/oauth/token`;
    this.baseURL = `${process.env.TRIBE_DOMAIN}/api/v1`;
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
   * Processing what is returned, extracting and returning the accessToken
   */
  private processAuthResponse = (response: TribeApiAuthResponse): string => {
    if (response.access_token === undefined) {
      // this will be caught (below), and passed through ErrorFactory
      throw new RepositoryAuthenticationError('No access token received');
    }
    return response.access_token;
  };

  /**
   * Base function to send the Auth request to the API
   */
  private getResponse = (): TE.TaskEither<Error, TribeApiAuthResponseAxios> =>
    TE.tryCatch(
      () => {
        const requiredEnvVars = [
          'TRIBE_CLIENT_ID',
          'TRIBE_CLIENT_SECRET',
          'TRIBE_USER',
        ];
        confirmEnvVars(requiredEnvVars);
        // type casting as we have checked these above
        const body = new URLSearchParams({
          client_id: process.env.TRIBE_CLIENT_ID as string,
          client_secret: process.env.TRIBE_CLIENT_SECRET as string,
          email: process.env.TRIBE_USER as string,
          grant_type: 'tribe:client_secret_credentials',
        });
        return axios.post<TribeApiAuthResponse>(this.authURL, body);
      },
      (error: AxiosError) =>
        this.errorFactory.error(error, 'RepositoryAuthenticationError')
    );

  /**
   * Makes the auth request
   */
  private getTokenFromSource(): TE.TaskEither<Error, string> {
    return pipe(
      this.getResponse(),
      TE.map((resp) => resp.data),
      logAction(
        this.logger,
        this.errorFactory,
        'successfully retrieved token',
        'failed to retrieve token'
      ),
      TE.fold(TE.left, (response) =>
        TE.right(this.processAuthResponse(response))
      )
    );
  }

  /**
   * Breaks the auth request (for testing)
   */
  public testBreakAuth(): void {
    this.authURL = `${process.env.TRIBE_DOMAIN}/something/completely/wrong`;
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
