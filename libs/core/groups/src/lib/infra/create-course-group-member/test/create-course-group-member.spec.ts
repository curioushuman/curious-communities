import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { RequestInvalidError } from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { CourseGroupMemberModule } from '../../../test/course-group-member.module.fake';
import { MutateCourseGroupMemberModule } from '../../../mutate-course-group-member.module';
import { MutateCourseGroupMemberRequestDto } from '../../../infra/dto/mutate-course-group-member.request.dto';
import { GroupMember } from '../../../domain/entities/group-member';
import { GroupMemberBuilder } from '../../../test/builders/group-member.builder';
import { CreateCourseGroupMemberController } from '../../create-course-group-member/create-course-group-member.controller';
import { FakeGroupMemberRepository } from '../../../adapter/implementations/fake/fake.group-member.repository';
import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';

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

const feature = loadFeature('./create-course-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeGroupMemberRepository;
  let controller: CreateCourseGroupMemberController;

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
    controller = moduleRef.get<CreateCourseGroupMemberController>(
      CreateCourseGroupMemberController
    );
  });

  afterAll(async () => {
    await app.close();
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
    let createCourseGroupDto: MutateCourseGroupMemberRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createCourseGroupDto = GroupMemberBuilder()
        .doesntExist()
        .buildMutateCourseGroupMemberRequestDto();

      groupMembers = await executeTask(repository.all());
      groupMembersBefore = groupMembers.length;
    });

    when('I attempt to create a group member', async () => {
      try {
        result = await controller.create(createCourseGroupDto);
      } catch (err) {
        error = err as Error;
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

  test('Fail; Invalid request', ({ given, when, then }) => {
    let createCourseGroupMemberDto: MutateCourseGroupMemberRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      createCourseGroupMemberDto = GroupMemberBuilder()
        .invalidOther()
        .buildMutateCourseGroupMemberRequestDto();
    });

    when('I attempt to create a group member', async () => {
      try {
        await controller.create(createCourseGroupMemberDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
