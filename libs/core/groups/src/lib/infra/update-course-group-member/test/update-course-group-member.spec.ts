import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { RequestInvalidError } from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { CourseGroupMemberModule } from '../../../test/course-group-member.module.fake';
import { MutateCourseGroupMemberModule } from '../../../mutate-course-group-member.module';
import { MutateCourseGroupMemberRequestDto } from '../../../infra/dto/mutate-course-group-member.request.dto';
import { GroupMemberBuilder } from '../../../test/builders/group-member.builder';
import { UpdateCourseGroupMemberController } from '../../update-course-group-member/update-course-group-member.controller';
import { FakeGroupMemberRepository } from '../../../adapter/implementations/fake/fake.group-member.repository';
import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';

/**
 * INTEGRATION TEST
 * SUT = the controller, the command handler
 *
 * NOTES:
 * - the controller does so little, so rather than update a separate unit test
 *  for it, we'll just test it here
 *
 * TODO
 * - [ ] need to mock an error for internal error testing
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-course-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeGroupMemberRepository;
  let controller: UpdateCourseGroupMemberController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CourseGroupMemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    MutateCourseGroupMemberModule.applyDefaults(app);
    repository = moduleRef.get<GroupMemberRepository>(
      GroupMemberRepository
    ) as FakeGroupMemberRepository;
    controller = moduleRef.get<UpdateCourseGroupMemberController>(
      UpdateCourseGroupMemberController
    );
  });

  afterAll(async () => {
    await app.close();
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
    let updateCourseGroupMemberRequestDto: MutateCourseGroupMemberRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      updateCourseGroupMemberRequestDto = GroupMemberBuilder()
        .updated()
        .buildMutateCourseGroupMemberRequestDto();
    });

    and('the group member does exist in our DB', async () => {
      const groupMembers = await executeTask(repository.all());
      const groupMemberBefore = groupMembers.find(
        (groupMember) =>
          groupMember.email ===
          updateCourseGroupMemberRequestDto.participant.email
      );
      expect(groupMemberBefore).toBeDefined();
      if (groupMemberBefore) {
        expect(groupMemberBefore.status).not.toEqual(
          updateCourseGroupMemberRequestDto.participant.status
        );
      }
    });

    when('I attempt to update a group member', async () => {
      try {
        result = await controller.update(updateCourseGroupMemberRequestDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been updated', async () => {
      const groupMembers = await executeTask(repository.all());
      const groupMemberAfter = groupMembers.find(
        (groupMember) =>
          groupMember.email ===
          updateCourseGroupMemberRequestDto.participant.email
      );
      expect(groupMemberAfter).toBeDefined();
      if (groupMemberAfter) {
        expect(groupMemberAfter.status).toEqual(
          updateCourseGroupMemberRequestDto.participant.status
        );
      }
    });

    and('saved group member is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let updateCourseGroupMemberRequestDto: MutateCourseGroupMemberRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      updateCourseGroupMemberRequestDto = GroupMemberBuilder()
        .exists()
        .invalidOther()
        .buildMutateCourseGroupMemberRequestDto();
    });

    when('I attempt to update a group member', async () => {
      try {
        await controller.update(updateCourseGroupMemberRequestDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
