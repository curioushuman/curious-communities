import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask } from '@curioushuman/fp-ts-utils';
import {
  Auth0ApiHttpConfigService,
  Auth0ApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { MemberSourceRepositoryReadWrite } from '../../../ports/member-source.repository';
import { MemberSource } from '../../../../domain/entities/member-source';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';
import { Auth0ApiMemberSourceRepository } from '../member-source.repository';
import { MemberSourceRepositoryErrorFactory } from '../../../ports/member-source.repository.error-factory';
import { MemberSourceBuilder } from '../../../../test/builders/member-source.builder';
import { MemberEmail } from '../../../../domain/value-objects/member-email';
import { MemberSourceIdSource } from '../../../../domain/value-objects/member-source-id-source';

/**
 * INTEGRATION TEST
 * SUT = the findOne function OF an external repository
 * i.e. are we actually connecting with and getting data from SF
 *
 * Scope
 * - repository functions and behaviours
 * - changes to API/data structure
 * - handling of their various responses/errors
 */

const feature = loadFeature('./member-source.find-one.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: Auth0ApiMemberSourceRepository;
  let memberSourceId: MemberSourceId;
  let memberSourceIdSource: MemberSourceIdSource;
  let memberEmail: MemberEmail;

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
          provide: MemberSourceRepositoryReadWrite,
          useClass: Auth0ApiMemberSourceRepository,
        },
        {
          provide: MemberSourceRepositoryErrorFactory,
          useClass: Auth0ApiRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<MemberSourceRepositoryReadWrite>(
      MemberSourceRepositoryReadWrite
    ) as Auth0ApiMemberSourceRepository;
  });

  test('Successfully find one member source by id', ({
    given,
    and,
    when,
    then,
  }) => {
    let result: MemberSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record exists at the source', async () => {
      // this is the simpler version
      // I know this ID exists, it'll do for now
      memberSourceId = 'auth0|602d8c44bea1a4006976281f' as MemberSourceId;
      memberSourceIdSource = {
        id: memberSourceId,
        source: 'AUTH',
      };
    });

    when('I request the source by ID', async () => {
      try {
        result = await executeTask(
          repository.findOneByIdSource(memberSourceIdSource)
        );
      } catch (err) {
        // if ('response' in err) {
        //   console.log(err.response);
        // }
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('a source corresponding to that ID should be returned', () => {
      expect(result.id).toEqual(memberSourceId);
    });
  });

  test('Successfully find one member source by email', ({
    given,
    and,
    when,
    then,
  }) => {
    let result: MemberSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record exists at the source', async () => {
      // this is the simpler version
      // I know this email exists (as alternate), it'll do for now
      memberEmail = 'michaelkelly@asiapacificforum.net' as MemberEmail;
    });

    when('I request the source by email', async () => {
      try {
        result = await executeTask(repository.findOneByEmail(memberEmail));
      } catch (err) {
        // console.log(err);
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('a source corresponding to that email should be returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Source not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let result: MemberSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record DOES NOT exist at the source', () => {
      memberSourceId = MemberSourceBuilder().noMatchingSource().build().id;
      memberSourceIdSource = {
        id: memberSourceId,
        source: 'AUTH',
      };
    });

    when('I request the source by ID', async () => {
      try {
        result = await executeTask(
          repository.findOneByIdSource(memberSourceIdSource)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive an Error', () => {
      // NOTE: we don't test for our application specific errors here
      // as they are one level above the repository
      expect(error).toBeInstanceOf(Error);
    });

    and('no result is returned', () => {
      expect(result).toBeUndefined();
    });
  });
});
