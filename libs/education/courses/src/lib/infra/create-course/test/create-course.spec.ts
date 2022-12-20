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

import { CoursesModule } from '../../../test/courses.module.fake';
import { CreateCourseModule } from '../../../create-course.module';
import { CreateCourseRequestDto } from '../dto/create-course.request.dto';
import { Course } from '../../../domain/entities/course';
import { CourseBuilder } from '../../../test/builders/course.builder';
import { CreateCourseController } from '../../../infra/create-course/create-course.controller';
import { FakeCourseRepository } from '../../../adapter/implementations/fake/fake.course.repository';
import { CourseRepository } from '../../../adapter/ports/course.repository';

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
  let app: INestApplication;
  let repository: FakeCourseRepository;
  let controller: CreateCourseController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CoursesModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    CreateCourseModule.applyDefaults(app);
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
      createCourseDto = CourseBuilder().beta().buildCreateCourseRequestDto();
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

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });

  test('Fail; Invalid request', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let createCourseDto: CreateCourseRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      createCourseDto = CourseBuilder().invalid().buildCreateCourseRequestDto();
    });

    when('I attempt to create a course', async () => {
      try {
        result = await controller.create(createCourseDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });
});
