import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { SourceInvalidError } from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { CourseModule } from '../../../test/course.module.fake';
import { Course } from '../../../domain/entities/course';
import { CourseBuilder } from '../../../test/builders/course.builder';
import { FakeCourseRepository } from '../../../adapter/implementations/fake/fake.course.repository';
import { CourseRepository } from '../../../adapter/ports/course.repository';
import { UpsertCourseController } from '../upsert-course.controller';
import { UpsertCourseRequestDto } from '../dto/upsert-course.request.dto';
import { prepareExternalIdSourceValue } from '@curioushuman/common';
import { CourseSourceBuilder } from '../../../test/builders/course-source.builder';
import { CourseSource } from '../../../domain/entities/course-source';

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

const feature = loadFeature('./upsert-course.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeCourseRepository;
  let controller: UpsertCourseController;

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
    controller = moduleRef.get<UpsertCourseController>(UpsertCourseController);
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
    let createCourseDto: UpsertCourseRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createCourseDto = CourseBuilder().beta().buildUpsertCourseRequestDto();
    });

    and('the course does not exist in the repository', async () => {
      courses = await executeTask(repository.all());
      coursesBefore = courses.length;
    });

    when('I attempt to upsert a course', async () => {
      try {
        result = await controller.upsert(createCourseDto);
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

  test('Successfully updating a course', ({ given, and, when, then }) => {
    let updatedCourseSource: CourseSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateCourseDto: UpsertCourseRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      updateCourseDto = CourseBuilder().updated().buildUpsertCourseRequestDto();
    });

    and('the course exists in the repository', async () => {
      // this is the courseSource we're building from
      updatedCourseSource = CourseSourceBuilder().updated().build();
      const courses = await executeTask(repository.all());
      const courseBefore = courses.find(
        (course) =>
          updateCourseDto.idSourceValue ===
          prepareExternalIdSourceValue(
            course.sourceIds[0].id,
            course.sourceIds[0].source
          )
      );
      expect(courseBefore).toBeDefined();
      if (courseBefore) {
        expect(courseBefore.name).not.toEqual(updatedCourseSource.name);
      }
    });

    when('I attempt to upsert a course', async () => {
      try {
        result = await controller.upsert(updateCourseDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'an existing record should have been updated in the repository',
      async () => {
        const courses = await executeTask(repository.all());
        const courseAfter = courses.find(
          (course) =>
            updateCourseDto.idSourceValue ===
            prepareExternalIdSourceValue(
              course.sourceIds[0].id,
              course.sourceIds[0].source
            )
        );
        expect(courseAfter).toBeDefined();
        if (courseAfter) {
          expect(courseAfter.name).toEqual(updatedCourseSource.name);
        }
      }
    );

    and('saved course is returned within payload', () => {
      expect(result.detail.id).toBeDefined();
      expect(result.event).toEqual('updated');
      expect(result.outcome).toEqual('success');
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let createCourseDto: UpsertCourseRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      createCourseDto = CourseBuilder()
        .invalidSource()
        .buildUpsertCourseRequestDto();
    });

    when('I attempt to create a course', async () => {
      try {
        await controller.upsert(createCourseDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
