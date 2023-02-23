import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import {
  RepositoryItemNotFoundError,
  RequestInvalidError,
  SourceInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { CourseModule } from '../../../test/course.module.fake';
import { CreateCourseRequestDto } from '../dto/create-course.request.dto';
import { Course } from '../../../domain/entities/course';
import { CourseBuilder } from '../../../test/builders/course.builder';
import { CreateCourseController } from '../../../infra/create-course/create-course.controller';
import { FakeCourseRepository } from '../../../adapter/implementations/fake/fake.course.repository';
import { CourseRepository } from '../../../adapter/ports/course.repository';

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

const feature = loadFeature('./create-course.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeCourseRepository;
  let controller: CreateCourseController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CourseModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    CourseModule.applyDefaults(app);
    repository = moduleRef.get<CourseRepository>(
      CourseRepository
    ) as FakeCourseRepository;
    controller = moduleRef.get<CreateCourseController>(CreateCourseController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a course', ({ given, and, when, then }) => {
    let courses: Course[];
    let coursesBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let createCourseDto: CreateCourseRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      createCourseDto = CourseBuilder().beta().buildUpsertCourseRequestDto();
    });

    and('a matching record is found at the source', async () => {
      courses = await executeTask(repository.all());
      coursesBefore = courses.length;
    });

    when('I attempt to create a course', async () => {
      try {
        result = await controller.create(createCourseDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'a new record should have been created in the repository',
      async () => {
        courses = await executeTask(repository.all());
        expect(courses.length).toEqual(coursesBefore + 1);
      }
    );

    and('saved course is returned within payload', () => {
      expect(result.detail.id).toBeDefined();
      expect(result.event).toEqual('created');
      expect(result.outcome).toEqual('success');
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let createCourseDto: CreateCourseRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      createCourseDto = CourseBuilder().invalid().buildUpsertCourseRequestDto();
    });

    when('I attempt to create a course', async () => {
      try {
        await controller.create(createCourseDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let createCourseDto: CreateCourseRequestDto;
    let error: Error;

    given('no record exists that matches our request', () => {
      createCourseDto = CourseBuilder()
        .noMatchingSource()
        .buildUpsertCourseRequestDto();
    });

    when('I attempt to create a course', async () => {
      try {
        await controller.create(createCourseDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });

  test('Fail; Source does not translate into a valid Course', ({
    given,
    and,
    when,
    then,
  }) => {
    let createCourseDto: CreateCourseRequestDto;
    let error: Error;

    given('a matching record is found at the source', () => {
      createCourseDto = CourseBuilder()
        .invalidSource()
        .buildUpsertCourseRequestDto();
    });

    and('the returned source does not populate a valid Course', () => {
      // above
    });

    when('I attempt to create a course', async () => {
      try {
        await controller.create(createCourseDto);
      } catch (err) {
        error = err as Error;
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
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let createCourseDto: CreateCourseRequestDto;
    let error: Error;

    given('a matching record is found at the source', () => {
      // see next
    });

    and('the source DOES already exist in our DB', () => {
      createCourseDto = CourseBuilder().exists().buildUpsertCourseRequestDto();
    });

    when('I attempt to create a course', async () => {
      try {
        result = await controller.create(createCourseDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive undefined as a result', () => {
      expect(result.detail.id).toBeDefined();
      expect(result.event).toEqual('created');
      expect(result.outcome).toEqual('failure');
    });
  });
});
