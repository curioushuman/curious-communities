import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import {
  //   ErrorFactory,
  //   FakeRepositoryErrorFactory,
  //   RepositoryItemConflictError,
  //   SourceInvalidError,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { CourseGroupModule } from '../../../test/course-group.module.fake';
import { MutateCourseGroupModule } from '../../../mutate-course-group.module';
import { UpdateCourseGroupRequestDto } from '../dto/update-course-group.request.dto';
import { GroupBuilder } from '../../../test/builders/group.builder';
import { UpdateCourseGroupController } from '../../../infra/update-course-group/update-course-group.controller';
import { FakeCourseGroupRepository } from '../../../adapter/implementations/fake/fake.course-group.repository';
import { CourseGroupRepository } from '../../../adapter/ports/course-group.repository';

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

const feature = loadFeature('./update-course-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeCourseGroupRepository;
  let controller: UpdateCourseGroupController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CourseGroupModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    MutateCourseGroupModule.applyDefaults(app);
    repository = moduleRef.get<CourseGroupRepository>(
      CourseGroupRepository
    ) as FakeCourseGroupRepository;
    controller = moduleRef.get<UpdateCourseGroupController>(
      UpdateCourseGroupController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully updating a course group', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateCourseGroupDto: UpdateCourseGroupRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      updateCourseGroupDto = GroupBuilder()
        .exists()
        .buildUpdateCourseGroupRequestDto();
    });

    and('the group does exist in our DB', async () => {
      const groups = await executeTask(repository.all());
      const groupBefore = groups.find(
        (group) => group.courseId === updateCourseGroupDto.course.id
      );
      expect(groupBefore).toBeDefined();
      if (groupBefore) {
        expect(groupBefore.name).not.toEqual(updateCourseGroupDto.course.name);
      }
    });

    when('I attempt to update a group', async () => {
      try {
        result = await controller.update(updateCourseGroupDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the record should have been updated', async () => {
      const groups = await executeTask(repository.all());
      const groupAfter = groups.find(
        (group) => group.courseId === updateCourseGroupDto.course.id
      );
      expect(groupAfter).toBeDefined();
      if (groupAfter) {
        expect(groupAfter.name).toEqual(updateCourseGroupDto.course.name);
      }
    });

    and('saved group is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let updateCourseGroupDto: UpdateCourseGroupRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      updateCourseGroupDto = GroupBuilder()
        .exists()
        .invalidOther()
        .buildUpdateCourseGroupRequestDto();
    });

    when('I attempt to update a group', async () => {
      try {
        await controller.update(updateCourseGroupDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
