import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  InternalRequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  UpdateGroupMemberSourceCommand,
  UpdateGroupMemberSourceHandler,
} from '../update-group-member-source.command';
import { GroupMemberSourceRepositoryReadWrite } from '../../../../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.repository';
import { GroupMemberSourceBuilder } from '../../../../test/builders/group-member-source.builder';
import { UpdateGroupMemberSourceDto } from '../update-group-member-source.dto';
import { GroupMemberSourceRepositoryErrorFactory } from '../../../../adapter/ports/group-member-source.repository.error-factory';
import { GroupMemberBuilder } from '../../../../test/builders/group-member.builder';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-group-member-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupMemberSourceRepository;
  let handler: UpdateGroupMemberSourceHandler;
  let updateGroupMemberSourceDto: UpdateGroupMemberSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateGroupMemberSourceHandler,
        LoggableLogger,
        {
          provide: GroupMemberSourceRepositoryReadWrite,
          useClass: FakeGroupMemberSourceRepository,
        },
        {
          provide: GroupMemberSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupMemberSourceRepositoryReadWrite>(
      GroupMemberSourceRepositoryReadWrite
    ) as FakeGroupMemberSourceRepository;
    handler = moduleRef.get<UpdateGroupMemberSourceHandler>(
      UpdateGroupMemberSourceHandler
    );
  });

  test('Successfully updating a group member source', ({
    given,
    and,
    when,
    then,
  }) => {
    let groupMemberSourcesLengthBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let error: Error;

    given('the request is valid', async () => {
      updateGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildUpdateGroupMemberSourceDto();
      console.log(updateGroupMemberSourceDto);
    });

    and('a matching record is found at the source', async () => {
      const groupMemberSources = await executeTask(repository.all());
      groupMemberSourcesLengthBefore = groupMemberSources.length;
    });

    when('I attempt to update a group member source', async () => {
      try {
        result = await handler.execute(
          new UpdateGroupMemberSourceCommand(updateGroupMemberSourceDto)
        );
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been updated', async () => {
      const groupMemberSources = await executeTask(repository.all());
      expect(groupMemberSources.length).toEqual(groupMemberSourcesLengthBefore);
    });

    and('saved group member source is returned', () => {
      expect(result.memberId).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      const groupMember = GroupMemberBuilder().exists().invalidOther().build();
      updateGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildUpdateGroupMemberSourceDto(groupMember);
    });

    when('I attempt to update a group member source', async () => {
      try {
        await handler.execute(
          new UpdateGroupMemberSourceCommand(updateGroupMemberSourceDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a InternalRequestInvalidError', () => {
      expect(error).toBeInstanceOf(InternalRequestInvalidError);
    });
  });
});
