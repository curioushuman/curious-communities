import { NotFoundException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RepositoryItemConflictError,
  SourceInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateCourseCommand,
  CreateCourseHandler,
} from '../create-course.command';
import { CourseRepository } from '../../../../adapter/ports/course.repository';
import { FakeCourseRepository } from '../../../../adapter/implementations/fake/fake.course.repository';
import { CourseSourceRepository } from '../../../../adapter/ports/course-source.repository';
import { FakeCourseSourceRepository } from '../../../../adapter/implementations/fake/fake.course-source.repository';
import { Course } from '../../../../domain/entities/course';
import { CourseBuilder } from '../../../../test/builders/course.builder';
import { CreateCourseDto } from '../create-course.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-course.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeCourseRepository;
  let handler: CreateCourseHandler;
  let createCourseDto: CreateCourseDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCourseHandler,
        LoggableLogger,
        { provide: CourseRepository, useClass: FakeCourseRepository },
        {
          provide: CourseSourceRepository,
          useClass: FakeCourseSourceRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<CourseRepository>(
      CourseRepository
    ) as FakeCourseRepository;
    handler = moduleRef.get<CreateCourseHandler>(CreateCourseHandler);
  });

  test('Successfully creating a course', ({ given, and, when, then }) => {
    let courses: Course[];
    let coursesBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      createCourseDto = CourseBuilder().beta().buildCreateCourseDto();
    });

    and('the returned source populates a valid course', () => {
      // we know this to be true
      // out of scope for this test
    });

    and('the source does not already exist in our DB', async () => {
      courses = await executeTask(repository.all());
      coursesBefore = courses.length;
    });

    when('I attempt to create a course', async () => {
      result = await handler.execute(new CreateCourseCommand(createCourseDto));
    });

    then('a new record should have been created', async () => {
      courses = await executeTask(repository.all());
      expect(courses.length).toEqual(coursesBefore + 1);
    });

    and('saved course is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let error: Error;

    given('no record exists that matches our request', () => {
      createCourseDto = CourseBuilder()
        .noMatchingSource()
        .buildCreateCourseDto();
    });

    when('I attempt to create a course', async () => {
      try {
        await handler.execute(new CreateCourseCommand(createCourseDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Source does not translate into a valid Course', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      createCourseDto = CourseBuilder().invalidSource().buildCreateCourseDto();
    });

    and('the returned source does not populate a valid Course', () => {
      // this occurs during
    });

    when('I attempt to create a course', async () => {
      try {
        await handler.execute(new CreateCourseCommand(createCourseDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });

  test('Fail; Source already exists in our DB', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      // confirmed
    });

    and('the returned source populates a valid course', () => {
      // known
    });

    and('the source DOES already exist in our DB', () => {
      createCourseDto = CourseBuilder().exists().buildCreateCourseDto();
    });

    when('I attempt to create a course', async () => {
      try {
        await handler.execute(new CreateCourseCommand(createCourseDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive an RepositoryItemConflictError', () => {
      expect(error).toBeInstanceOf(RepositoryItemConflictError);
    });
  });

  test('Fail; Source is an invalid status to be created in admin', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      // we know this
    });

    and('the returned source has an invalid status', () => {
      createCourseDto = CourseBuilder().invalidStatus().buildCreateCourseDto();
    });

    when('I attempt to create a course', async () => {
      try {
        await handler.execute(new CreateCourseCommand(createCourseDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
