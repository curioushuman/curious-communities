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
import { UpdateCourseRequestDto } from '../dto/update-course.request.dto';
import { CourseBuilder } from '../../../test/builders/course.builder';
import { UpdateCourseController } from '../../../infra/update-course/update-course.controller';
import { FakeCourseRepository } from '../../../adapter/implementations/fake/fake.course.repository';
import { CourseRepository } from '../../../adapter/ports/course.repository';
import { CourseSourceBuilder } from '../../../test/builders/course-source.builder';
import { CourseSource } from '../../../domain/entities/course-source';
import { CourseSourceRepository } from '../../../adapter/ports/course-source.repository';
import { FakeCourseSourceRepository } from '../../../adapter/implementations/fake/fake.course-source.repository';
import { prepareExternalIdSourceValue } from '@curioushuman/common';

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

const feature = loadFeature('./update-course.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeCourseRepository;
  let courseSourceRepository: FakeCourseSourceRepository;
  let controller: UpdateCourseController;

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
    courseSourceRepository = moduleRef.get<CourseSourceRepository>(
      CourseSourceRepository
    ) as FakeCourseSourceRepository;
    controller = moduleRef.get<UpdateCourseController>(UpdateCourseController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully updating a course', ({ given, and, when, then }) => {
    let updatedCourseSource: CourseSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateCourseDto: UpdateCourseRequestDto;
    let error: Error;

    given('the request is valid', () => {
      updateCourseDto = CourseBuilder().updated().buildUpdateCourseRequestDto();
    });

    and('a matching record is found at the source', async () => {
      updatedCourseSource = CourseSourceBuilder().updated().build();
      // save it to our fake repo
      executeTask(courseSourceRepository.save(updatedCourseSource));
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

    when('I attempt to update a course', async () => {
      try {
        result = await controller.update(updateCourseDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'the related record should have been updated in the repository',
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

    and('saved course is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let updateCourseDto: UpdateCourseRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      updateCourseDto = CourseBuilder().invalid().buildUpdateCourseRequestDto();
    });

    when('I attempt to update a course', async () => {
      try {
        await controller.update(updateCourseDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let updateCourseDto: UpdateCourseRequestDto;
    let error: Error;

    given('no record exists that matches our request', () => {
      updateCourseDto = CourseBuilder()
        .noMatchingSource()
        .buildUpdateCourseRequestDto();
    });

    when('I attempt to update a course', async () => {
      try {
        await controller.update(updateCourseDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });

  test('Fail; Course not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let updateCourseDto: UpdateCourseRequestDto;
    let error: Error;

    given('a matching record is found at the source', () => {
      updateCourseDto = CourseBuilder()
        .doesntExist()
        .buildUpdateCourseRequestDto();
    });

    and('the returned source populates a valid course', () => {
      // above
    });

    and('the source does NOT exist in our DB', () => {
      // above
    });

    when('I attempt to update a course', async () => {
      try {
        await controller.update(updateCourseDto);
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
    let updateCourseDto: UpdateCourseRequestDto;
    let error: Error;

    given('a matching record is found at the source', () => {
      updateCourseDto = CourseBuilder()
        .invalidSource()
        .buildUpdateCourseRequestDto();
    });

    and('the returned source does not populate a valid Course', () => {
      // above
    });

    when('I attempt to update a course', async () => {
      try {
        await controller.update(updateCourseDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
