import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { executeTask } from '@curioushuman/fp-ts-utils';

import { CourseModule } from '../../../test/course.module.fake';
import { CourseBuilder } from '../../../test/builders/course.builder';
import { CourseRepository } from '../../../adapter/ports/course.repository';
import { FakeCourseRepository } from '../../../adapter/implementations/fake/fake.course.repository';
import { UpdateCourseController } from '../update-course.controller';
import { UpdateCourseRequestDto } from '../dto/update-course.request.dto';

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
    controller = moduleRef.get<UpdateCourseController>(UpdateCourseController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully updating a course', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateCourseDto: UpdateCourseRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      updateCourseDto = CourseBuilder().updated().buildUpdateCourseRequestDto();
    });

    and('the course exists in the repository', async () => {
      const courses = await executeTask(repository.all());
      const courseBefore = courses.find(
        (course) => updateCourseDto.course.id === course.id
      );
      expect(courseBefore).toBeDefined();
      if (courseBefore) {
        expect(courseBefore.name).not.toEqual(updateCourseDto.course.name);
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
      'an existing record should have been updated in the repository',
      async () => {
        const courses = await executeTask(repository.all());
        const courseAfter = courses.find(
          (course) => updateCourseDto.course.id === course.id
        );
        expect(courseAfter).toBeDefined();
        if (courseAfter) {
          expect(courseAfter.name).toEqual(updateCourseDto.course.name);
        }
      }
    );

    and('saved course is returned within payload', () => {
      expect(result.detail.id).toBeDefined();
      expect(result.event).toEqual('updated');
      expect(result.outcome).toEqual('success');
    });
  });

  // test('Fail; Course does not exist', ({ given, and, when, then }) => {
  //   let updateCourseDto: UpdateCourseRequestDto;
  //   let error: Error;

  //   given('the request is valid', () => {
  //     updateCourseDto = CourseBuilder()
  //       .doesntExist()
  //       .buildUpdateCourseRequestDto();
  //   });

  //   and('the course does not exist in the repository', () => {
  //     // above
  //   });

  //   when('I attempt to update a course', async () => {
  //     try {
  //       await controller.update(updateCourseDto);
  //     } catch (err) {
  //       error = err as Error;
  //     }
  //   });

  //   then('I should receive a RepositoryItemNotFoundError', () => {
  //     expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
  //   });
  // });

  // test('Fail; Invalid request', ({ given, when, then }) => {
  //   let updateCourseDto: UpdateCourseRequestDto;
  //   let error: Error;

  //   given('the request contains invalid data', () => {
  //     updateCourseDto = CourseBuilder()
  //       .invalid()
  //       .buildUpdateCourseRequestDto();
  //   });

  //   when('I attempt to create a course', async () => {
  //     try {
  //       await controller.update(updateCourseDto);
  //     } catch (err) {
  //       error = err as Error;
  //     }
  //   });

  //   then('I should receive a RequestInvalidError', () => {
  //     expect(error).toBeInstanceOf(RequestInvalidError);
  //   });
  // });
});
