import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask, logAction } from '@curioushuman/fp-ts-utils';
import { EdAppApiRepositoryErrorFactory } from './repository.error-factory';
import { confirmEnvVars } from '../../../utils/functions';

/**
 * Setting up Authorization header and other HTTP config options
 *
 * REF:
 * - https://support.edapp.com/api/authentication
 *
 * TODO
 * - [ ] test whether or not the non-DI inclusion of errorFactory behaves as expected
 * - [ ] cache token
 */

@Injectable()
export class EdAppApiHttpConfigService implements HttpModuleOptionsFactory {
  private logger: LoggableLogger;
  private errorFactory: EdAppApiRepositoryErrorFactory;
  private authURL: string | undefined;
  private baseURL: string;

  constructor() {
    this.errorFactory = new EdAppApiRepositoryErrorFactory();
    this.logger = new LoggableLogger(EdAppApiHttpConfigService.name);
    const requiredEnvVars = ['ED_APP_DOMAIN'];
    confirmEnvVars(requiredEnvVars);
    this.authURL = undefined;
    this.baseURL = `${process.env.ED_APP_DOMAIN}/v2/`;
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
   * EdApp doesn't require auth request
   */
  private getTokenFromSource(): TE.TaskEither<Error, string> {
    return TE.tryCatch(
      async () => {
        const requiredEnvVars = ['ED_APP_API_KEY'];
        confirmEnvVars(requiredEnvVars);
        return process.env.ED_APP_API_KEY as string;
      },
      (error: Error) =>
        this.errorFactory.error(error, 'RepositoryAuthenticationError')
    );
  }
}
