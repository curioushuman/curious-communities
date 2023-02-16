import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryAuthenticationError } from '@curioushuman/error-factory';
import { executeTask, logAction } from '@curioushuman/fp-ts-utils';
import { BettermodeApiRepositoryErrorFactory } from './repository.error-factory';
import { confirmEnvVars } from '../../../utils/functions';
import {
  BettermodeApiAuthResponse,
  BettermodeApiAuthResponseAxios,
} from './__types__';

/**
 * Setting up Authorization header and other HTTP config options
 *
 * NOTES:
 * - bettermode asks you to authorize as a guest, prior to as an admin
 *
 * REFERENCES:
 * - https://developers.bettermode.com/docs/guide/graphql/authentication/tribe-access-token/
 * - https://developers.bettermode.com/docs/guide/graphql/making-queries/
 *
 * TODO
 * - [ ] cache token
 */

@Injectable()
export class BettermodeApiHttpConfigService
  implements HttpModuleOptionsFactory
{
  private logger: LoggableLogger;
  private errorFactory: BettermodeApiRepositoryErrorFactory;
  private authURL: string;
  private baseURL: string;

  constructor() {
    this.errorFactory = new BettermodeApiRepositoryErrorFactory();
    this.logger = new LoggableLogger(BettermodeApiHttpConfigService.name);
    const requiredEnvVars = ['BETTERMODE_DOMAIN'];
    confirmEnvVars(requiredEnvVars);
    this.authURL = `${process.env.BETTERMODE_DOMAIN}/graphql`;
    this.baseURL = `${process.env.BETTERMODE_DOMAIN}/graphql`;
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

  private prepareAuthQueryBase(): string {
    return `accessToken
      role {
        name
        scopes
      }
      member {
        id
        name
      }`;
  }

  private prepareAuthQueryGuest = (authQueryBase: string): string => {
    const requiredEnvVars = ['BETTERMODE_COMMUNITY_DOMAIN'];
    confirmEnvVars(requiredEnvVars);
    const communityDomain = process.env.BETTERMODE_COMMUNITY_DOMAIN as string;
    return `query GuestToken {
      tokens(networkDomain: "${communityDomain}") {
        ${authQueryBase}
      }
    }`;
  };

  private prepareAuthQueryAdmin = (authQueryBase: string): string => {
    const requiredEnvVars = ['BETTERMODE_USER', 'BETTERMODE_PASSWORD'];
    confirmEnvVars(requiredEnvVars);
    const user = process.env.BETTERMODE_USER as string;
    const password = process.env.BETTERMODE_PASSWORD as string;
    return `mutation AdminToken {
      loginNetwork(
        input: { usernameOrEmail: "${user}", password: "${password}" }
      ) {
        ${authQueryBase}
      }
    }`;
  };

  /**
   * Processing what is returned, extracting and returning the accessToken
   */
  private processAuthResponse = (
    response: BettermodeApiAuthResponse
  ): string => {
    if (response.errors) {
      throw this.errorFactory.error(
        response.errors[0],
        'RepositoryAuthenticationError'
      );
    }
    // separate between the two auth responses
    const authData =
      'tokens' in response.data
        ? response.data.tokens
        : response.data.loginNetwork;
    if (authData.accessToken === undefined) {
      // this will be caught (below), and passed through ErrorFactory
      throw new RepositoryAuthenticationError('No access token received');
    }
    return authData.accessToken;
  };

  /**
   * Base function to send the Auth request to the API
   */
  private getResponse =
    (url: string, query: string) =>
    (
      accessToken?: string
    ): TE.TaskEither<Error, BettermodeApiAuthResponseAxios> =>
      TE.tryCatch(
        () => {
          const body = { query };
          const authBearer = accessToken ? `Bearer ${accessToken}` : undefined;
          const headers = {
            'Content-Type': 'application/json',
            Authorization: authBearer,
          };
          return axios.post<BettermodeApiAuthResponse>(url, body, {
            headers,
          });
        },
        (error: Error) =>
          this.errorFactory.error(error, 'RepositoryAuthenticationError')
      );

  /**
   * Makes the auth request
   */
  private getTokenFromSource(): TE.TaskEither<Error, string> {
    // base auth query
    const authQueryBase = this.prepareAuthQueryBase();
    // no accessToken required for guest auth
    const accessToken: string | undefined = undefined;
    // then we pipe the accessToken from guest request, into admin request
    return pipe(
      accessToken,
      this.getResponse(this.authURL, this.prepareAuthQueryGuest(authQueryBase)),
      TE.map((resp) => resp.data),
      logAction(
        this.logger,
        this.errorFactory,
        'successfully retrieved guest token',
        'failed to retrieve guest token'
      ),
      TE.fold(TE.left, (response) =>
        TE.right(this.processAuthResponse(response))
      ),
      TE.chain((guestToken) =>
        pipe(
          guestToken,
          this.getResponse(
            this.authURL,
            this.prepareAuthQueryAdmin(authQueryBase)
          ),
          TE.map((resp) => resp.data),
          logAction(
            this.logger,
            this.errorFactory,
            'successfully retrieved admin token',
            'failed to retrieve admin token'
          ),
          TE.fold(TE.left, (response) =>
            TE.right(this.processAuthResponse(response))
          )
        )
      )
    );
  }

  /**
   * Breaks the auth request (for testing)
   */
  public testBreakAuth(): void {
    this.authURL = `${process.env.BETTERMODE_DOMAIN}/something/completely/wrong`;
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
