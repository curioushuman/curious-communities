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
  UpdateCourseGroupCommand,
  UpdateCourseGroupHandler,
} from '../update-course-group.command';
import { CourseGroupRepository } from '../../../../adapter/ports/course-group.repository';
import { FakeCourseGroupRepository } from '../../../../adapter/implementations/fake/fake.course-group.repository';
import { GroupBuilder } from '../../../../test/builders/group.builder';
import { UpdateCourseGroupDto } from '../update-course-group.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-course-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeCourseGroupRepository;
  let handler: UpdateCourseGroupHandler;
  let updateCourseGroupDto: UpdateCourseGroupDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCourseGroupHandler,
        LoggableLogger,
        { provide: CourseGroupRepository, useClass: FakeCourseGroupRepository },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<CourseGroupRepository>(
      CourseGroupRepository
    ) as FakeCourseGroupRepository;
    handler = moduleRef.get<UpdateCourseGroupHandler>(UpdateCourseGroupHandler);
  });

  test('Successfully updating a course group', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      updateCourseGroupDto = GroupBuilder()
        .updated()
        .buildUpdateCourseGroupDto();
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
      result = await handler.execute(
        new UpdateCourseGroupCommand(updateCourseGroupDto)
      );
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

  test('Fail; Group not found for course ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('the request is valid', () => {
      updateCourseGroupDto = GroupBuilder()
        .doesntExist()
        .buildUpdateCourseGroupDto();
    });

    and('the group does NOT exist in our DB', async () => {
      const groups = await executeTask(repository.all());
      const groupBefore = groups.find(
        (group) => group.courseId === updateCourseGroupDto.course.id
      );
      expect(groupBefore).toBeUndefined();
    });

    when('I attempt to update a group', async () => {
      try {
        await handler.execute(
          new UpdateCourseGroupCommand(updateCourseGroupDto)
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
      updateCourseGroupDto = GroupBuilder()
        .exists()
        .invalidOther()
        .buildUpdateCourseGroupDto();
    });

    when('I attempt to update a group', async () => {
      try {
        await handler.execute(
          new UpdateCourseGroupCommand(updateCourseGroupDto)
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
