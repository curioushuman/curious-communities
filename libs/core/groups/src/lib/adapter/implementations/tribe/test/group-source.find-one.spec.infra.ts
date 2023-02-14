import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask } from '@curioushuman/fp-ts-utils';
import {
  TribeApiHttpConfigService,
  TribeApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { GroupSourceRepositoryReadWrite } from '../../../ports/group-source.repository';
import { GroupSource } from '../../../../domain/entities/group-source';
import { GroupSourceId } from '../../../../domain/value-objects/group-source-id';
import { TribeApiGroupSourceRepository } from '../group-source.repository';
import { GroupSourceRepositoryErrorFactory } from '../../../ports/group-source.repository.error-factory';
import { GroupSourceBuilder } from '../../../../test/builders/group-source.builder';
import { GroupEmail } from '../../../../domain/value-objects/group-email';
import { GroupSourceIdSource } from '../../../../domain/value-objects/group-source-id-source';

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

// Tribe API is suuuper slow
jest.setTimeout(20000);

const feature = loadFeature('./group-source.find-one.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: TribeApiGroupSourceRepository;
  let groupSourceId: GroupSourceId;
  let groupSourceIdSource: GroupSourceIdSource;
  let groupEmail: GroupEmail;

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
          provide: GroupSourceRepositoryReadWrite,
          useClass: TribeApiGroupSourceRepository,
        },
        {
          provide: GroupSourceRepositoryErrorFactory,
          useClass: TribeApiRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupSourceRepositoryReadWrite>(
      GroupSourceRepositoryReadWrite
    ) as TribeApiGroupSourceRepository;
  });

  test('Successfully find one group source by id', ({
    given,
    and,
    when,
    then,
  }) => {
    let result: GroupSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record exists at the source', async () => {
      // this is the simpler version
      // I know this ID exists, it'll do for now
      groupSourceId = '5fb59b15628186115ab8eecb' as GroupSourceId;
      groupSourceIdSource = {
        id: groupSourceId,
        source: 'MICRO-COURSE',
      };
    });

    when('I request the source by ID', async () => {
      try {
        result = await executeTask(
          repository.findOneByIdSource(groupSourceIdSource)
        );
      } catch (err) {
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('a source corresponding to that ID should be returned', () => {
      expect(result.id).toEqual(groupSourceId);
    });
  });

  test('Successfully find one group source by email', ({
    given,
    and,
    when,
    then,
  }) => {
    let result: GroupSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record exists at the source', async () => {
      // this is the simpler version
      // I know this email exists (as alternate), it'll do for now
      groupEmail = 'michaelkelly@asiapacificforum.net' as GroupEmail;
    });

    when('I request the source by email', async () => {
      try {
        result = await executeTask(repository.findOneByEmail(groupEmail));
      } catch (err) {
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
    let result: GroupSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record DOES NOT exist at the source', () => {
      groupSourceId = GroupSourceBuilder().noMatchingSource().buildNoCheck().id;
      groupSourceIdSource = {
        id: groupSourceId,
        source: 'COMMUNITY',
      };
    });

    when('I request the source by ID', async () => {
      try {
        result = await executeTask(
          repository.findOneByIdSource(groupSourceIdSource)
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
