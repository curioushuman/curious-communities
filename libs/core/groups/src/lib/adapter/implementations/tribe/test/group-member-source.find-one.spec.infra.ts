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
import { GroupMemberSource } from '../../../../domain/entities/group-member-source';
import { TribeApiGroupMemberSourceRepository } from '../group-member-source.repository';
import { GroupMemberSourceRepositoryErrorFactory } from '../../../ports/group-member-source.repository.error-factory';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';
import { GroupSourceId } from '../../../../domain/value-objects/group-source-id';
import { MemberEmail } from '../../../../domain/value-objects/member-email';

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

const feature = loadFeature('./group-member-source.find-one.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: TribeApiGroupMemberSourceRepository;
  let groupSourceId: GroupSourceId;

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

    // this is the simpler version
    // I know this ID exists, it'll do for now
    groupSourceId = '616609d6165a9354cc963968' as GroupSourceId;
  });

  test('Successfully find one group member source by member id', ({
    given,
    and,
    when,
    then,
  }) => {
    let groupMemberSourceId: MemberSourceId;
    let result: GroupMemberSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record exists at the source', async () => {
      // this is the simpler version
      // I know this ID exists, it'll do for now
      groupMemberSourceId = '5fb59b15628186115ab8eecb' as MemberSourceId;
    });

    when('I request the source by ID', async () => {
      try {
        result = await executeTask(
          repository.findOneByMemberId({
            value: groupMemberSourceId,
            parentId: groupSourceId,
          })
        );
      } catch (err) {
        if ('response' in err) {
          console.log(err.response);
        }
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a source corresponding to that ID should be returned', () => {
      expect(result.memberId).toEqual(groupMemberSourceId);
    });
  });

  test('Successfully find one group member source by email', ({
    given,
    and,
    when,
    then,
  }) => {
    let groupMemberEmail: MemberEmail;
    let result: GroupMemberSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record exists at the source', async () => {
      // this is the simpler version
      // I know this name exists (as alternate), it'll do for now
      groupMemberEmail = 'michaelkelly@asiapacificforum.net' as MemberEmail;
    });

    when('I request the source by email', async () => {
      try {
        result = await executeTask(
          repository.findOneByMemberEmail({
            value: groupMemberEmail,
            parentId: groupSourceId,
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

    then('a source corresponding to that email should be returned', () => {
      expect(result.memberEmail).toEqual(groupMemberEmail);
    });
  });

  test('Fail; Source not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let groupMemberSourceId: MemberSourceId;
    let result: GroupMemberSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record DOES NOT exist at the source', () => {
      groupMemberSourceId = '5f18c98dc5e54200075dAAAA' as MemberSourceId;
    });

    when('I request the source by ID', async () => {
      try {
        result = await executeTask(
          repository.findOneByMemberId({
            value: groupMemberSourceId,
            parentId: groupSourceId,
          })
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
