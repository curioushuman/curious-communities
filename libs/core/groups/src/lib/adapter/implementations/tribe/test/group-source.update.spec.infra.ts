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
import { TribeApiGroupSourceRepository } from '../group-source.repository';
import { GroupSourceRepositoryErrorFactory } from '../../../ports/group-source.repository.error-factory';
import { GroupSourceBuilder } from '../../../../test/builders/group-source.builder';
import { GroupSourceId } from '../../../../domain/value-objects/group-source-id';
import { GroupEmail } from '../../../../domain/value-objects/group-email';

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

const feature = loadFeature('./group-source.update.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: TribeApiGroupSourceRepository;
  let groupSourceUpdated: GroupSource;
  let groupSourceForUpdate: GroupSource;

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

  test('Successfully updating a group source', ({ given, and, when, then }) => {
    let checkGroupSource: GroupSource;
    let error: Error;

    given('the request is valid', () => {
      groupSourceForUpdate = GroupSourceBuilder().updated().buildNoCheck();
      groupSourceForUpdate.id = '5fb59b15628186115ab8eecb' as GroupSourceId;
      groupSourceForUpdate.email =
        'michaelkelly@asiapacificforum.net' as GroupEmail;
    });

    when('I attempt to update a group source', async () => {
      try {
        groupSourceUpdated = await executeTask(
          repository.update(groupSourceForUpdate)
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
        checkGroupSource = await executeTask(
          repository.findOneByIdSource({
            id: groupSourceForUpdate.id,
            source: 'MICRO-COURSE',
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

    and('saved group source is returned', () => {
      expect(groupSourceUpdated.email).toEqual(checkGroupSource.email);
    });
  });
});
