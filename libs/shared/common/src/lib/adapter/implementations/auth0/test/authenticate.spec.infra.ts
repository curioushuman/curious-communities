import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';
import { HttpModule, HttpModuleOptions } from '@nestjs/axios';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  ErrorFactory,
  RepositoryAuthenticationError,
} from '@curioushuman/error-factory';
import { Auth0ApiHttpConfigService } from '../http-config.service';
import { Auth0ApiRepositoryErrorFactory } from '../repository.error-factory';

/**
 * INTEGRATION TEST
 * SUT = authenticating with an external repository
 * i.e. are we actually connecting
 *
 * Scope
 * - repository authorisation
 *
 * NOTE: repository functions and behaviours handled in separate tests
 */

const feature = loadFeature('./authenticate.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let httpConfigService: Auth0ApiHttpConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        HttpModule.registerAsync({
          useClass: Auth0ApiHttpConfigService,
        }),
      ],
      providers: [
        LoggableLogger,
        {
          provide: ErrorFactory,
          useClass: Auth0ApiRepositoryErrorFactory,
        },
      ],
    }).compile();

    httpConfigService = moduleRef.get<Auth0ApiHttpConfigService>(
      Auth0ApiHttpConfigService
    );
  });

  test('Successful authentication with repository', ({
    given,
    and,
    when,
    then,
  }) => {
    let result: HttpModuleOptions;

    given('the repository is live', () => {
      // assumed
    });

    and('I am authorised to access the source', () => {
      // assumed
    });

    when('I attempt attempt to authenticate', async () => {
      try {
        result = await httpConfigService.createHttpOptions();
      } catch (err) {
        expect(err).toBeUndefined();
      }
    });

    then('I should receive a positive result', () => {
      expect(result?.headers?.Authorization).toBeDefined();
    });
  });

  test('Fail; Unable to authenticate with source repository', ({
    given,
    and,
    when,
    then,
  }) => {
    let result: HttpModuleOptions;
    let error: Error;

    given('the repository is live', () => {
      // assumed
    });

    and('I am NOT authorised to access the source repository', () => {
      httpConfigService.testBreakAuth();
    });

    when('I attempt to access the source', async () => {
      try {
        result = await httpConfigService.createHttpOptions();
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryAuthenticationError', () => {
      expect(error).toBeInstanceOf(RepositoryAuthenticationError);
    });

    and('no result is returned', () => {
      expect(result).toBeUndefined();
    });
  });
});
