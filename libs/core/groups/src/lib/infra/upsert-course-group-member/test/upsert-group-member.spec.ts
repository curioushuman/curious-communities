import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { RequestInvalidError } from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { GroupMemberModule } from '../../../test/group-member.module.fake';
import { GroupMember } from '../../../domain/entities/group-member';
import { GroupMemberBuilder } from '../../../test/builders/group-member.builder';
import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../../../adapter/implementations/fake/fake.group-member.repository';
import { UpsertCourseGroupMemberController } from '../upsert-course-group-member.controller';
import { UpsertCourseGroupMemberRequestDto } from '../dto/upsert-course-group-member.request.dto';

/**
 * INTEGRATION TEST
 * SUT = the controller, the command handler
 *
 * NOTES:
 * - the controller does so little, so rather than create a separate unit test
 *  for it, we'll just test it here
 *
 * TODO
 * - [ ] need to mock an error for internal error testing
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./upsert-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeGroupMemberRepository;
  let controller: UpsertCourseGroupMemberController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupMemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    GroupMemberModule.applyDefaults(app);
    repository = moduleRef.get<GroupMemberRepository>(
      GroupMemberRepository
    ) as FakeGroupMemberRepository;
    controller = moduleRef.get<UpsertCourseGroupMemberController>(
      UpsertCourseGroupMemberController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a group member', ({ given, and, when, then }) => {
    let groupMembers: GroupMember[];
    let groupMembersBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let createGroupMemberDto: UpsertCourseGroupMemberRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createGroupMemberDto = GroupMemberBuilder()
        .beta()
        .buildCreateCourseGroupMemberRequestDto();
    });

    and('the group member does not exist in the repository', async () => {
      groupMembers = await executeTask(repository.all());
      groupMembersBefore = groupMembers.length;
    });

    when('I attempt to upsert a group member', async () => {
      try {
        result = await controller.upsert(createGroupMemberDto);
      } catch (err) {
        error = err as Error;
        console.log(error);
        expect(error).toBeUndefined();
      }
    });

    then('a new record should have been created', async () => {
      groupMembers = await executeTask(repository.all());
      expect(groupMembers.length).toEqual(groupMembersBefore + 1);
    });

    and('saved group member is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully updating a group member', ({ given, and, when, then }) => {
    let groupMembersLengthBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateGroupMemberDto: UpsertCourseGroupMemberRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      updateGroupMemberDto = GroupMemberBuilder()
        .updatedCourse()
        .buildUpdateCourseGroupMemberRequestDto();
    });

    and('the group member exists in the repository', async () => {
      const groupMembers = await executeTask(repository.all());
      const groupMemberBefore = groupMembers.find(
        (groupMember) =>
          'participantId' in groupMember &&
          updateGroupMemberDto.participant.id === groupMember.participantId
      );
      expect(groupMemberBefore).toBeDefined();
      groupMembersLengthBefore = groupMembers.length;
    });

    when('I attempt to upsert a group member', async () => {
      try {
        result = await controller.upsert(updateGroupMemberDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'an existing record should have been updated in the repository',
      async () => {
        const groupMembers = await executeTask(repository.all());
        const groupMemberAfter = groupMembers.find(
          (groupMember) =>
            'participantId' in groupMember &&
            updateGroupMemberDto.participant.id === groupMember.participantId
        );
        expect(groupMemberAfter).toBeDefined();
        if (groupMemberAfter) {
          // in this instance, nothing will have changed
          // expect(groupMemberAfter.name).toEqual(
          //   updateGroupMemberDto.participant.name
          // );
          // just double check something hasn't been added
          expect(groupMembers.length).toEqual(groupMembersLengthBefore);
        }
      }
    );

    and('saved group member is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let createGroupMemberDto: UpsertCourseGroupMemberRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      createGroupMemberDto = GroupMemberBuilder()
        .invalidOther()
        .buildCreateCourseGroupMemberRequestDto();
    });

    when('I attempt to create a group member', async () => {
      try {
        await controller.upsert(createGroupMemberDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
