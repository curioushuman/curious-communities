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
import {
  GroupSource,
  GroupSourceForCreate,
} from '../../../../domain/entities/group-source';
import { TribeApiGroupSourceRepository } from '../group-source.repository';
import { GroupSourceRepositoryErrorFactory } from '../../../ports/group-source.repository.error-factory';
import { GroupSourceBuilder } from '../../../../test/builders/group-source.builder';

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

const feature = loadFeature('./group-source.create.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: TribeApiGroupSourceRepository;
  let groupSourceCreated: GroupSource;
  let groupSourceForCreate: GroupSourceForCreate;

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

  test('Successfully creating a group source', ({ given, and, when, then }) => {
    let checkGroupSource: GroupSource;
    let error: Error;

    given('the request is valid', () => {
      groupSourceForCreate = GroupSourceBuilder().buildForCreate();
    });

    when('I attempt to create a group source', async () => {
      try {
        groupSourceCreated = await executeTask(
          repository.create(groupSourceForCreate)
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
        checkGroupSource = await executeTask(
          repository.findOneByName(groupSourceForCreate.name)
        );
      } catch (err) {
        if ('response' in err) {
          console.log(err.response);
        }
        error = err;
        expect(error).toBeUndefined();
      }
    });

    and('saved group source is returned', () => {
      expect(groupSourceCreated.id).toEqual(checkGroupSource.id);
    });
  });

  afterAll(async () => {
    try {
      const groupCreated = await executeTask(
        repository.findOneByName(groupSourceForCreate.name)
      );
      if (groupCreated) {
        await executeTask(repository.delete(groupCreated.id));
      }
    } catch (err) {
      if ('response' in err) {
        console.log(err.response);
      }
    }
  });
});
