import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateCourseGroupMemberCommand,
  CreateCourseGroupMemberHandler,
} from '../create-course-group-member.command';
import { GroupMemberRepository } from '../../../../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../../../../adapter/implementations/fake/fake.group-member.repository';
import { GroupMember } from '../../../../domain/entities/group-member';
import { GroupMemberBuilder } from '../../../../test/builders/group-member.builder';
import { CreateCourseGroupMemberDto } from '../create-course-group-member.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-course-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupMemberRepository;
  let handler: CreateCourseGroupMemberHandler;
  let createCourseGroupMemberDto: CreateCourseGroupMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCourseGroupMemberHandler,
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
    handler = moduleRef.get<CreateCourseGroupMemberHandler>(
      CreateCourseGroupMemberHandler
    );
  });

  test('Successfully creating a course group member', ({
    given,
    and,
    when,
    then,
  }) => {
    let groupMembers: GroupMember[];
    let groupMembersBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createCourseGroupMemberDto = GroupMemberBuilder()
        .alpha()
        .buildCreateCourseGroupMemberDto();

      groupMembers = await executeTask(repository.all());
      groupMembersBefore = groupMembers.length;
    });

    when('I attempt to create a group member', async () => {
      result = await handler.execute(
        new CreateCourseGroupMemberCommand(createCourseGroupMemberDto)
      );
    });

    then('a new record should have been created', async () => {
      groupMembers = await executeTask(repository.all());
      expect(groupMembers.length).toEqual(groupMembersBefore + 1);
    });

    and('saved group member is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      createCourseGroupMemberDto = GroupMemberBuilder()
        .invalidOther()
        .buildCreateCourseGroupMemberDto();
    });

    when('I attempt to create a group member', async () => {
      try {
        await handler.execute(
          new CreateCourseGroupMemberCommand(createCourseGroupMemberDto)
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
