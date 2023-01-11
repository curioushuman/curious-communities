import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RepositoryItemNotFoundError,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  UpdateCourseGroupMemberCommand,
  UpdateCourseGroupMemberHandler,
} from '../update-course-group-member.command';
import { GroupMemberRepository } from '../../../../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../../../../adapter/implementations/fake/fake.group-member.repository';
import { GroupMemberBuilder } from '../../../../test/builders/group-member.builder';
import { UpdateCourseGroupMemberDto } from '../update-course-group-member.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-course-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupMemberRepository;
  let handler: UpdateCourseGroupMemberHandler;
  let updateCourseGroupMemberDto: UpdateCourseGroupMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCourseGroupMemberHandler,
        LoggableLogger,
        { provide: GroupMemberRepository, useClass: FakeGroupMemberRepository },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupMemberRepository>(
      GroupMemberRepository
    ) as FakeGroupMemberRepository;
    handler = moduleRef.get<UpdateCourseGroupMemberHandler>(
      UpdateCourseGroupMemberHandler
    );
  });

  test('Successfully updating a course group member', ({
    given,
    and,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      updateCourseGroupMemberDto = GroupMemberBuilder()
        .updated()
        .buildUpdateCourseGroupMemberDto();
    });

    and('the group member does exist in our DB', async () => {
      const groupMembers = await executeTask(repository.all());
      const groupMemberBefore = groupMembers.find(
        (groupMember) =>
          groupMember.email === updateCourseGroupMemberDto.groupMember.email
      );
      expect(groupMemberBefore).toBeDefined();
      if (groupMemberBefore) {
        expect(groupMemberBefore.status).not.toEqual(
          updateCourseGroupMemberDto.groupMember.status
        );
      }
    });

    when('I attempt to update a group member', async () => {
      result = await handler.execute(
        new UpdateCourseGroupMemberCommand(updateCourseGroupMemberDto)
      );
    });

    then('a record should have been updated', async () => {
      const groupMembers = await executeTask(repository.all());
      const groupMemberAfter = groupMembers.find(
        (groupMember) =>
          groupMember.email === updateCourseGroupMemberDto.groupMember.email
      );
      expect(groupMemberAfter).toBeDefined();
      if (groupMemberAfter) {
        expect(groupMemberAfter.status).toEqual(
          updateCourseGroupMemberDto.groupMember.status
        );
      }
    });

    and('saved group member is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Group member not found', ({ given, and, when, then }) => {
    let error: Error;

    given('the request is valid', () => {
      updateCourseGroupMemberDto = GroupMemberBuilder()
        .doesntExist()
        .buildUpdateCourseGroupMemberDto();
    });

    and('the group member does NOT exist in our DB', async () => {
      const groupMembers = await executeTask(repository.all());
      const groupMemberBefore = groupMembers.find(
        (groupMember) =>
          groupMember.email === updateCourseGroupMemberDto.groupMember.email
      );
      expect(groupMemberBefore).toBeUndefined();
    });

    when('I attempt to update a group', async () => {
      try {
        await handler.execute(
          new UpdateCourseGroupMemberCommand(updateCourseGroupMemberDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      updateCourseGroupMemberDto = GroupMemberBuilder()
        .exists()
        .invalidOther()
        .buildUpdateCourseGroupMemberDto();
    });

    when('I attempt to update a group member', async () => {
      try {
        await handler.execute(
          new UpdateCourseGroupMemberCommand(updateCourseGroupMemberDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
