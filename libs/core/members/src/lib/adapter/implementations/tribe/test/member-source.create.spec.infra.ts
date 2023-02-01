import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask } from '@curioushuman/fp-ts-utils';
import {
  TribeApiHttpConfigService,
  TribeApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { MemberSourceRepository } from '../../../ports/member-source.repository';
import {
  MemberSource,
  MemberSourceForCreate,
} from '../../../../domain/entities/member-source';
import { TribeApiMemberSourceRepository } from '../member-source.repository';
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

// tribe API is slow
jest.setTimeout(20000);

const feature = loadFeature('./member-source.create.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: TribeApiMemberSourceRepository;
  let memberSourceCreated: MemberSource;
  let memberSourceForCreate: MemberSourceForCreate;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        HttpModule.registerAsync({
          useClass: TribeApiHttpConfigService,
        }),
      ],
      providers: [
        LoggableLogger,
        {
          provide: MemberSourceRepository,
          useClass: TribeApiMemberSourceRepository,
        },
        {
          provide: MemberSourceRepositoryErrorFactory,
          useClass: TribeApiRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<MemberSourceRepository>(
      MemberSourceRepository
    ) as TribeApiMemberSourceRepository;
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
        if ('response' in err) {
          console.log(err.response);
        }
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
        if ('response' in err) {
          console.log(err.response);
        }
        error = err;
        expect(error).toBeUndefined();
      }
    });

    and('saved member source is returned', () => {
      expect(memberSourceCreated.id).toEqual(checkMemberSource.id);
    });
  });

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
