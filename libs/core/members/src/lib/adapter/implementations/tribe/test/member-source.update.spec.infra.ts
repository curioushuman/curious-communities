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
import { MemberSource } from '../../../../domain/entities/member-source';
import { TribeApiMemberSourceRepository } from '../member-source.repository';
import { MemberSourceRepositoryErrorFactory } from '../../../ports/member-source.repository.error-factory';
import { MemberSourceBuilder } from '../../../../test/builders/member-source.builder';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';
import { MemberEmail } from '../../../../domain/value-objects/member-email';

/**
 * INTEGRATION TEST
 * SUT = the update function OF an external repository
 * i.e. are we actually connecting with external repo
 *
 * Scope
 * - repository functions and behaviours
 * - changes to API/data structure
 * - handling of their various responses/errors
 */

const feature = loadFeature('./member-source.update.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: TribeApiMemberSourceRepository;
  let memberSourceUpdated: MemberSource;
  let memberSourceForUpdate: MemberSource;

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

  test('Successfully updating a member source', ({
    given,
    and,
    when,
    then,
  }) => {
    let checkMemberSource: MemberSource;
    let error: Error;

    given('the request is valid', () => {
      memberSourceForUpdate = MemberSourceBuilder().updated().build();
      memberSourceForUpdate.id = '5fb59b15628186115ab8eecb' as MemberSourceId;
      memberSourceForUpdate.email =
        'michaelkelly@asiapacificforum.net' as MemberEmail;
    });

    when('I attempt to update a member source', async () => {
      try {
        memberSourceUpdated = await executeTask(
          repository.update(memberSourceForUpdate)
        );
      } catch (err) {
        if ('response' in err) {
          console.log(err.response);
        }
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('a new record should have been updated', async () => {
      try {
        checkMemberSource = await executeTask(
          repository.findOneByIdSource({
            id: memberSourceForUpdate.id,
            source: 'COMMUNITY',
          })
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
      expect(memberSourceUpdated.email).toEqual(checkMemberSource.email);
    });
  });
});
