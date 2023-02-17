import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask } from '@curioushuman/fp-ts-utils';
import {
  EdAppApiHttpConfigService,
  EdAppApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { GroupSourceRepositoryReadWrite } from '../../../ports/group-source.repository';
import { GroupSource } from '../../../../domain/entities/group-source';
import { GroupSourceId } from '../../../../domain/value-objects/group-source-id';
import { EdAppApiGroupSourceRepository } from '../group-source.repository';
import { GroupSourceRepositoryErrorFactory } from '../../../ports/group-source.repository.error-factory';
import { GroupName } from '../../../../domain/value-objects/group-name';
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

// EdApp API is suuuper slow
jest.setTimeout(20000);

const feature = loadFeature('./group-source.find-one.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: EdAppApiGroupSourceRepository;
  let groupSourceId: GroupSourceId;
  let groupSourceIdSource: GroupSourceIdSource;
  let groupName: GroupName;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        HttpModule.registerAsync({
          useClass: EdAppApiHttpConfigService,
        }),
      ],
      providers: [
        LoggableLogger,
        {
          provide: GroupSourceRepositoryReadWrite,
          useClass: EdAppApiGroupSourceRepository,
        },
        {
          provide: GroupSourceRepositoryErrorFactory,
          useClass: EdAppApiRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupSourceRepositoryReadWrite>(
      GroupSourceRepositoryReadWrite
    ) as EdAppApiGroupSourceRepository;
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
      groupSourceId = '603011505afc22bf0ebc991c' as GroupSourceId;
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
        expect(error).toBeUndefined();
      }
    });

    then('a source corresponding to that ID should be returned', () => {
      expect(result.id).toEqual(groupSourceId);
    });
  });

  test('Successfully find one group source by name', ({
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
      // I know this name exists (as alternate), it'll do for now
      groupName = 'Samoa OMB' as GroupName;
    });

    when('I request the source by name', async () => {
      try {
        result = await executeTask(repository.findOneByName(groupName));
      } catch (err) {
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('a source corresponding to that name should be returned', () => {
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
      groupSourceIdSource = {
        id: '602ac5101d5f77deefd64444',
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
