import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  SourceInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  UpdateCourseCommand,
  UpdateCourseHandler,
} from '../update-course.command';
import { CourseRepository } from '../../../../adapter/ports/course.repository';
import { FakeCourseRepository } from '../../../../adapter/implementations/fake/fake.course.repository';
import { CourseSourceRepository } from '../../../../adapter/ports/course-source.repository';
import { FakeCourseSourceRepository } from '../../../../adapter/implementations/fake/fake.course-source.repository';
import { CourseBuilder } from '../../../../test/builders/course.builder';
import { UpdateCourseDto } from '../update-course.dto';
import { CourseRepositoryErrorFactory } from '../../../../adapter/ports/course.repository.error-factory';
import { CourseSourceRepositoryErrorFactory } from '../../../../adapter/ports/course-source.repository.error-factory';
import { CourseSourceBuilder } from '../../../../test/builders/course-source.builder';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-course.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeCourseRepository;
  let handler: UpdateCourseHandler;
  let updateCourseDto: UpdateCourseDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCourseHandler,
        LoggableLogger,
        { provide: CourseRepository, useClass: FakeCourseRepository },
        {
          provide: CourseSourceRepository,
          useClass: FakeCourseSourceRepository,
        },
        {
          provide: CourseRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
        {
          provide: CourseSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<CourseRepository>(
      CourseRepository
    ) as FakeCourseRepository;
    handler = moduleRef.get<UpdateCourseHandler>(UpdateCourseHandler);
  });

  test('Successfully updating a course', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      updateCourseDto = CourseBuilder().updated().buildUpdateCourseDto();
    });

    and('the record does exist in our DB', async () => {
      const courses = await executeTask(repository.all());
      const courseBefore = courses.find(
        (course) => course.id === updateCourseDto.course.id
      );
      expect(courseBefore).toBeDefined();
      if (courseBefore) {
        expect(courseBefore.name).not.toEqual(updateCourseDto.course.name);
      }
    });

    when('I attempt to update a course', async () => {
      try {
        result = await handler.execute(
          new UpdateCourseCommand(updateCourseDto)
        );
      } catch (err) {
        expect(err).toBeUndefined();
      }
    });

    then(
      'the related record should have been updated in the repository',
      async () => {
        const courses = await executeTask(repository.all());
        const courseAfter = courses.find(
          (course) => course.id === updateCourseDto.course.id
        );
        expect(courseAfter).toBeDefined();
        if (courseAfter) {
          expect(courseAfter.name).toEqual(updateCourseDto.course.name);
        }
      }
    );

    and('saved course is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  // test('Fail; Source does not translate into a valid Course', ({
  //   given,
  //   and,
  //   when,
  //   then,
  // }) => {
  //   let error: Error;

  //   given('a matching record is found at the source', () => {
  //     const courseSource = CourseSourceBuilder().invalidSource().buildNoCheck();
  //     updateCourseDto = CourseBuilder()
  //       .invalidSource()
  //       .buildUpdateCourseDto(courseSource);
  //   });

  //   and('the returned source does not populate a valid Course', () => {
  //     // above
  //   });

  //   when('I attempt to update a course', async () => {
  //     try {
  //       await handler.execute(new UpdateCourseCommand(updateCourseDto));
  //     } catch (err) {
  //       error = err;
  //     }
  //   });

  //   then('I should receive a SourceInvalidError', () => {
  //     expect(error).toBeInstanceOf(SourceInvalidError);
  //   });
  // });
});
