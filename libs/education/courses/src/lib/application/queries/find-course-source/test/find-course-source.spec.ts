import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  FindCourseSourceQuery,
  FindCourseSourceHandler,
} from '../find-course-source.query';
import { CourseSourceRepository } from '../../../../adapter/ports/course-source.repository';
import { FakeCourseSourceRepository } from '../../../../adapter/implementations/fake/fake.course-source.repository';
import { CourseSourceBuilder } from '../../../../test/builders/course-source.builder';
import { FindCourseSourceDto } from '../find-course-source.dto';
import { CourseSourceRepositoryErrorFactory } from '../../../../adapter/ports/course-source.repository.error-factory';

/**
 * UNIT TEST
 * SUT = the query & query handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-course-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindCourseSourceHandler;
  let findCourseSourceDto: FindCourseSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindCourseSourceHandler,
        LoggableLogger,
        {
          provide: CourseSourceRepository,
          useClass: FakeCourseSourceRepository,
        },
        {
          provide: CourseSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindCourseSourceHandler>(FindCourseSourceHandler);
  });

  test('Successfully finding a course-source by Source Id', ({
    given,
    and,
    when,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findCourseSourceDto = CourseSourceBuilder()
        .exists()
        .buildFindByIdSourceValueCourseSourceDto();
    });

    when('I attempt to find a course-source', async () => {
      result = await handler.execute(
        new FindCourseSourceQuery(findCourseSourceDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      findCourseSourceDto = CourseSourceBuilder()
        .invalid()
        .buildFindByIdSourceValueCourseSourceDto();
    });

    when('I attempt to find a course-source', async () => {
      try {
        await handler.execute(new FindCourseSourceQuery(findCourseSourceDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
