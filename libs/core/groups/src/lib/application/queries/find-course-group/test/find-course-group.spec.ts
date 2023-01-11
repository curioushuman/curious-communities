import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  FindCourseGroupQuery,
  FindCourseGroupHandler,
} from '../find-course-group.query';
import { CourseGroupRepository } from '../../../../adapter/ports/course-group.repository';
import { FakeCourseGroupRepository } from '../../../../adapter/implementations/fake/fake.course-group.repository';
import { GroupBuilder } from '../../../../test/builders/group.builder';
import { FindCourseGroupDto } from '../find-course-group.dto';

/**
 * UNIT TEST
 * SUT = the query & query handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-course-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindCourseGroupHandler;
  let findCourseGroupDto: FindCourseGroupDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindCourseGroupHandler,
        LoggableLogger,
        { provide: CourseGroupRepository, useClass: FakeCourseGroupRepository },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindCourseGroupHandler>(FindCourseGroupHandler);
  });

  test('Successfully finding a group by Id', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findCourseGroupDto = GroupBuilder()
        .exists()
        .buildFindByIdCourseGroupDto();
    });

    when('I attempt to find a group', async () => {
      result = await handler.execute(
        new FindCourseGroupQuery(findCourseGroupDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a group by Source Id', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findCourseGroupDto = GroupBuilder()
        .exists()
        .buildFindByIdSourceValueCourseGroupDto();
    });

    when('I attempt to find a group', async () => {
      result = await handler.execute(
        new FindCourseGroupQuery(findCourseGroupDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a group by slug', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findCourseGroupDto = GroupBuilder()
        .exists()
        .buildFindBySlugCourseGroupDto();
    });

    when('I attempt to find a group', async () => {
      result = await handler.execute(
        new FindCourseGroupQuery(findCourseGroupDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      findCourseGroupDto = GroupBuilder()
        .invalid()
        .buildFindByIdSourceValueCourseGroupDto();
    });

    when('I attempt to find a group', async () => {
      try {
        await handler.execute(new FindCourseGroupQuery(findCourseGroupDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
