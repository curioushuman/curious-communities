import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { CourseModule } from '../../../test/course.module.fake';
import { FindCourseModule } from '../../../find-course.module';
import {
  FindByIdCourseRequestDto,
  FindByIdSourceValueCourseRequestDto,
} from '../dto/find-course.request.dto';
import { CourseBuilder } from '../../../test/builders/course.builder';
import { FindCourseController } from '../../../infra/find-course/find-course.controller';
import { RequestInvalidError } from '@curioushuman/error-factory';

/**
 * INTEGRATION TEST
 * SUT = the controller, the query handler
 *
 * NOTES:
 * - the controller does so little, so rather than find a separate unit test
 *  for it, we'll just test it here
 *
 * TODO
 * - [ ] need to mock an error for internal error testing
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-course.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: FindCourseController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CourseModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    FindCourseModule.applyDefaults(app);
    controller = moduleRef.get<FindCourseController>(FindCourseController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully finding a course by Id', ({ given, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findCourseDto: FindByIdCourseRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findCourseDto = CourseBuilder().exists().buildFindByIdCourseRequestDto();
    });

    when('I attempt to find a course', async () => {
      try {
        result = await controller.findById(findCourseDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      expect(result.id).toEqual(findCourseDto.id);
    });
  });

  test('Successfully finding a course by Source Id', ({
    given,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findCourseDto: FindByIdSourceValueCourseRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findCourseDto = CourseBuilder()
        .exists()
        .buildFindByIdSourceValueCourseRequestDto();
    });

    when('I attempt to find a course', async () => {
      try {
        result = await controller.findByIdSourceValue(findCourseDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      expect(result.sourceIds[0]).toEqual(findCourseDto.idSourceValue);
    });
  });

  test('Fail; Invalid request', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findCourseDto: FindByIdSourceValueCourseRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      findCourseDto = CourseBuilder()
        .invalid()
        .buildFindByIdSourceValueCourseRequestDto();
    });

    when('I attempt to find a course', async () => {
      try {
        result = await controller.find(findCourseDto);
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
