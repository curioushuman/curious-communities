import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  RepositoryItemNotFoundError,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import { FindCourseQuery, FindCourseHandler } from '../find-course.query';
import { CourseRepository } from '../../../../adapter/ports/course.repository';
import { FakeCourseRepository } from '../../../../adapter/implementations/fake/fake.course.repository';
import { CourseBuilder } from '../../../../test/builders/course.builder';
import { FindCourseDto } from '../find-course.dto';
import { CourseRepositoryErrorFactory } from '../../../../adapter/ports/course.repository.error-factory';

/**
 * UNIT TEST
 * SUT = the query & query handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-course.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindCourseHandler;
  let findCourseDto: FindCourseDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindCourseHandler,
        LoggableLogger,
        { provide: CourseRepository, useClass: FakeCourseRepository },
        {
          provide: CourseRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindCourseHandler>(FindCourseHandler);
  });

  test('Successfully finding a course by Id', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findCourseDto = CourseBuilder().exists().buildFindByIdCourseDto();
    });

    when('I attempt to find a course', async () => {
      result = await handler.execute(new FindCourseQuery(findCourseDto));
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a course by Source Id', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findCourseDto = CourseBuilder()
        .exists()
        .buildFindByIdSourceValueCourseDto();
    });

    when('I attempt to find a course', async () => {
      result = await handler.execute(new FindCourseQuery(findCourseDto));
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; course not found', ({ given, and, when, then }) => {
    let error: Error;

    given('the request is valid', () => {
      findCourseDto = CourseBuilder()
        .doesntExist()
        .buildFindByIdSourceValueCourseDto();
    });

    and('the course does NOT exist in the DB', () => {
      // above
    });

    when('I attempt to find a course', async () => {
      try {
        await handler.execute(new FindCourseQuery(findCourseDto));
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
      findCourseDto = CourseBuilder()
        .invalid()
        .buildFindByIdSourceValueCourseDto();
    });

    when('I attempt to find a course', async () => {
      try {
        await handler.execute(new FindCourseQuery(findCourseDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
