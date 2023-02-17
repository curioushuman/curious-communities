import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask } from '@curioushuman/fp-ts-utils';
import {
  TribeApiHttpConfigService,
  TribeApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { GroupMemberSourceRepositoryReadWrite } from '../../../ports/group-member-source.repository';
import {
  GroupMemberSource,
  GroupMemberSourceForCreate,
} from '../../../../domain/entities/group-member-source';
import { TribeApiGroupMemberSourceRepository } from '../group-member-source.repository';
import { GroupMemberSourceRepositoryErrorFactory } from '../../../ports/group-member-source.repository.error-factory';
import { GroupMemberSourceBuilder } from '../../../../test/builders/group-member-source.builder';
import { GroupSourceId } from '../../../../domain/value-objects/group-source-id';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';

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

// edApp API is slow
jest.setTimeout(20000);

const feature = loadFeature('./group-member-source.create.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: TribeApiGroupMemberSourceRepository;
  let groupMemberSourceCreated: GroupMemberSource;
  let groupMemberSourceForCreate: GroupMemberSourceForCreate;

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
          provide: GroupMemberSourceRepositoryReadWrite,
          useClass: TribeApiGroupMemberSourceRepository,
        },
        {
          provide: GroupMemberSourceRepositoryErrorFactory,
          useClass: TribeApiRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupMemberSourceRepositoryReadWrite>(
      GroupMemberSourceRepositoryReadWrite
    ) as TribeApiGroupMemberSourceRepository;
  });

  test.skip('Successfully creating a group member source', ({
    given,
    and,
    when,
    then,
  }) => {
    let checkGroupMemberSource: GroupMemberSource;
    let error: Error;

    given('the request is valid', () => {
      groupMemberSourceForCreate = GroupMemberSourceBuilder().buildForCreate();
      groupMemberSourceForCreate.groupId =
        '602ac5101d5f77deefd636b6' as GroupSourceId;
      groupMemberSourceForCreate.memberId =
        '5fb59b15628186115ab8eecb' as MemberSourceId;
    });

    when('I attempt to create a group member source', async () => {
      try {
        groupMemberSourceCreated = await executeTask(
          repository.create(groupMemberSourceForCreate)
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
        checkGroupMemberSource = await executeTask(
          repository.findOneByMemberId({
            value: groupMemberSourceForCreate.memberId,
            parentId: groupMemberSourceForCreate.groupId,
          })
        );
      } catch (err) {
        if ('response' in err) {
          console.log(err.response);
        }
        error = err;
        expect(error).toBeUndefined();
      }
    });

    and('saved group member source is returned', () => {
      expect(groupMemberSourceCreated.memberId).toEqual(
        checkGroupMemberSource.memberId
      );
    });
  });

  afterAll(async () => {
    try {
      const groupMemberCreated = await executeTask(
        repository.findOneByMemberId({
          value: groupMemberSourceForCreate.memberId,
          parentId: groupMemberSourceForCreate.groupId,
        })
      );
      if (groupMemberCreated) {
        await executeTask(repository.delete(groupMemberCreated));
      }
    } catch (err) {
      // if ('response' in err) {
      //   console.log(err.response);
      // }
    }
  });
});
