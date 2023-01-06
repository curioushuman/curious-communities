import { NotFoundException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
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
import { CourseSource } from '../../../../domain/entities/course-source';
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
  let courseSourcerepository: FakeCourseSourceRepository;
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
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<CourseRepository>(
      CourseRepository
    ) as FakeCourseRepository;
    courseSourcerepository = moduleRef.get<CourseSourceRepository>(
      CourseSourceRepository
    ) as FakeCourseSourceRepository;
    handler = moduleRef.get<UpdateCourseHandler>(UpdateCourseHandler);
  });

  test('Successfully updating a course', ({ given, and, when, then }) => {
    let updatedCourseSource: CourseSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      updateCourseDto = CourseBuilder().exists().buildUpdateCourseDto();
    });

    and('the returned source populates a valid course', async () => {
      // this is an updated version of the `exists()` courseSource
      updatedCourseSource = CourseSourceBuilder().updated().build();
      // save it to our fake repo, we know it is valid
      executeTask(courseSourcerepository.save(updatedCourseSource));
    });

    and('the source does exist in our DB', async () => {
      const courses = await executeTask(repository.all());
      const courseBefore = courses.find(
        (course) => course.sourceIds[0].id === updateCourseDto.id
      );
      expect(courseBefore).toBeDefined();
      if (courseBefore) {
        expect(courseBefore.name).not.toEqual(updatedCourseSource.name);
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
          (course) => course.sourceIds[0].id === updateCourseDto.id
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

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let error: Error;

    given('no record exists that matches our request', () => {
      updateCourseDto = CourseBuilder()
        .noMatchingSource()
        .buildUpdateCourseDto();
    });

    when('I attempt to update a course', async () => {
      try {
        await handler.execute(new UpdateCourseCommand(updateCourseDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Course not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      updateCourseDto = CourseBuilder().alpha().buildUpdateCourseDto();
    });

    and('the returned source populates a valid course', () => {
      // we know this to be true
    });

    and('the source does NOT exist in our DB', () => {
      // we know this to be true
    });

    when('I attempt to update a course', async () => {
      try {
        await handler.execute(new UpdateCourseCommand(updateCourseDto));
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
      updateCourseDto = CourseBuilder().invalidSource().buildUpdateCourseDto();
    });

    and('the returned source does not populate a valid Course', () => {
      // this occurs during
    });

    when('I attempt to update a course', async () => {
      try {
        await handler.execute(new UpdateCourseCommand(updateCourseDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });

  test('Fail; Source is an invalid status to be updated in admin', ({
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
      updateCourseDto = CourseBuilder().invalidStatus().buildUpdateCourseDto();
    });

    when('I attempt to update a course', async () => {
      try {
        await handler.execute(new UpdateCourseCommand(updateCourseDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
