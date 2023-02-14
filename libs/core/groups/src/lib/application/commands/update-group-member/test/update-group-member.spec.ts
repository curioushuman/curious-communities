import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  InternalRequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  UpdateGroupMemberCommand,
  UpdateGroupMemberHandler,
} from '../update-group-member.command';
import { GroupMemberRepository } from '../../../../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../../../../adapter/implementations/fake/fake.group-member.repository';
import { GroupMemberSourceRepositoryReadWrite } from '../../../../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.repository';
import { GroupMemberBuilder } from '../../../../test/builders/group-member.builder';
import { UpdateGroupMemberDto } from '../update-group-member.dto';
import { GroupMemberSourceBuilder } from '../../../../test/builders/group-member-source.builder';
import { GroupMemberRepositoryErrorFactory } from '../../../../adapter/ports/group-member.repository.error-factory';
import { GroupMemberSourceRepositoryErrorFactory } from '../../../../adapter/ports/group-member-source.repository.error-factory';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupMemberRepository;
  let handler: UpdateGroupMemberHandler;
  let updateGroupMemberDto: UpdateGroupMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateGroupMemberHandler,
        LoggableLogger,
        { provide: GroupMemberRepository, useClass: FakeGroupMemberRepository },
        {
          provide: GroupMemberSourceRepositoryReadWrite,
          useClass: FakeGroupMemberSourceRepository,
        },
        {
          provide: GroupMemberRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
        {
          provide: GroupMemberSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupMemberRepository>(
      GroupMemberRepository
    ) as FakeGroupMemberRepository;
    handler = moduleRef.get<UpdateGroupMemberHandler>(UpdateGroupMemberHandler);
  });

  test('Successfully updating a group member from course', ({
    given,
    and,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      updateGroupMemberDto = GroupMemberBuilder()
        .updated()
        .buildUpdateCourseGroupMemberDto();
    });

    and('the returned source populates a valid group member', async () => {
      // above
    });

    and('the source does exist in our DB', async () => {
      const groupMembers = await executeTask(repository.all());
      const groupMemberBefore = groupMembers.find(
        (groupMember) => groupMember.id === updateGroupMemberDto.groupMember.id
      );
      expect(groupMemberBefore).toBeDefined();
      if (groupMemberBefore) {
        expect(groupMemberBefore.name).not.toEqual(
          updateGroupMemberDto.participant?.name
        );
      }
    });

    when('I attempt to update a group member', async () => {
      try {
        result = await handler.execute(
          new UpdateGroupMemberCommand(updateGroupMemberDto)
        );
      } catch (err) {
        expect(err).toBeUndefined();
      }
    });

    then(
      'the related record should have been updated in the repository',
      async () => {
        const groupMembers = await executeTask(repository.all());
        const groupMemberAfter = groupMembers.find(
          (groupMember) =>
            groupMember.id === updateGroupMemberDto.groupMember.id
        );
        expect(groupMemberAfter).toBeDefined();
        if (groupMemberAfter) {
          expect(groupMemberAfter.name).toEqual(
            updateGroupMemberDto.participant?.name
          );
        }
      }
    );

    and('saved group member is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Source does not translate into a valid group member', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      const groupMemberSource = GroupMemberSourceBuilder()
        .invalid()
        .buildNoCheck();
      updateGroupMemberDto = GroupMemberBuilder()
        .invalidSource()
        .buildUpdateGroupMemberDto(groupMemberSource);
    });

    and('the returned source does not populate a valid group member', () => {
      // above
    });

    when('I attempt to update a group member', async () => {
      try {
        await handler.execute(
          new UpdateGroupMemberCommand(updateGroupMemberDto)
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
