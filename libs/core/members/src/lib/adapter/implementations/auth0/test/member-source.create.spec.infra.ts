import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask } from '@curioushuman/fp-ts-utils';
import {
  Auth0ApiHttpConfigService,
  Auth0ApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { MemberSourceRepository } from '../../../ports/member-source.repository';
import {
  MemberSource,
  MemberSourceForCreate,
} from '../../../../domain/entities/member-source';
import { Auth0ApiMemberSourceRepository } from '../member-source.repository';
import { MemberSourceRepositoryErrorFactory } from '../../../ports/member-source.repository.error-factory';
import { MemberSourceBuilder } from '../../../../test/builders/member-source.builder';

/**
 * INTEGRATION TEST
 * SUT = the create function OF an external repository
 * i.e. are we actually connecting with external repo
 *
 * Scope
 * - repository functions and behaviours
 * - changes to API/data structure
 * - handling of their various responses/errors
 */

const feature = loadFeature('./member-source.create.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: Auth0ApiMemberSourceRepository;
  let memberSourceCreated: MemberSource;
  let memberSourceForCreate: MemberSourceForCreate;

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
          provide: MemberSourceRepository,
          useClass: Auth0ApiMemberSourceRepository,
        },
        {
          provide: MemberSourceRepositoryErrorFactory,
          useClass: Auth0ApiRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<MemberSourceRepository>(
      MemberSourceRepository
    ) as Auth0ApiMemberSourceRepository;
  });

  test('Successfully creating a member source', ({
    given,
    and,
    when,
    then,
  }) => {
    let checkMemberSource: MemberSource;
    let error: Error;

    given('the request is valid', () => {
      memberSourceForCreate = MemberSourceBuilder().buildForCreate();
    });

    when('I attempt to create a member source', async () => {
      try {
        memberSourceCreated = await executeTask(
          repository.create(memberSourceForCreate)
        );
      } catch (err) {
        // if ('response' in err) {
        //   console.log(err.response);
        // }
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('a new record should have been created', async () => {
      try {
        checkMemberSource = await executeTask(
          repository.findOneByEmail(memberSourceForCreate.email)
        );
      } catch (err) {
        // if ('response' in err) {
        //   console.log(err.response);
        // }
        error = err;
        expect(error).toBeUndefined();
      }
    });

    and('saved member source is returned', () => {
      expect(memberSourceCreated.id).toEqual(checkMemberSource.id);
    });
  });

  // test('Fail; Source not found for ID provided', ({
  //   given,
  //   and,
  //   when,
  //   then,
  // }) => {
  //   let result: MemberSource;
  //   let error: Error;

  //   given('I am authorised to access the source', () => {
  //     // out of scope
  //   });

  //   and('a matching record DOES NOT exist at the source', () => {
  //     memberSourceId = MemberSourceBuilder().noMatchingSource().build().id;
  //     memberSourceIdSource = {
  //       id: memberSourceId,
  //       source: 'AUTH',
  //     };
  //   });

  //   when('I request the source by ID', async () => {
  //     try {
  //       result = await executeTask(
  //         repository.findOneByIdSource(memberSourceIdSource)
  //       );
  //     } catch (err) {
  //       error = err;
  //     }
  //   });

  //   then('I should receive an Error', () => {
  //     // NOTE: we don't test for our application specific errors here
  //     // as they are one level above the repository
  //     expect(error).toBeInstanceOf(Error);
  //   });

  //   and('no result is returned', () => {
  //     expect(result).toBeUndefined();
  //   });
  // });

  afterAll(async () => {
    try {
      const memberCreated = await executeTask(
        repository.findOneByEmail(memberSourceForCreate.email)
      );
      if (memberCreated) {
        await executeTask(repository.delete(memberCreated.id));
      }
    } catch (err) {
      if ('response' in err) {
        console.log(err.response);
      }
    }
  });
});
