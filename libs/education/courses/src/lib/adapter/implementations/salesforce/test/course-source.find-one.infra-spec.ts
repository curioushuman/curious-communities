import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { CourseSourceRepository } from '../../../ports/course-source.repository';
import { CourseSource } from '../../../../domain/entities/course-source';
import { FindCourseSourceDto } from '../../../../application/queries/find-course-source/find-course-source.dto';
import { CourseSourceId } from '../../../../domain/value-objects/course-source-id';
import { SalesforceApiHttpConfigService } from '../http-config.service';
import { SalesforceApiCourseSourceRepository } from '../course-source.repository';
import { CourseSourceRepositoryErrorFactory } from '../../../ports/course-source.repository.error-factory';
import { SalesforceApiRepositoryErrorFactory } from '../repository.error-factory';

/**
 * INTEGRATION TEST
 * SUT = the findOne function OF an external repository
 * i.e. are we actually connecting with and getting data from SF
 *
 * Scope
 * - repository functions and behaviours
 * - changes to API/data structure
 * - handling of their various responses/errors
 */

const feature = loadFeature('./course-source.find-one.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: SalesforceApiCourseSourceRepository;
  let findCourseSourceDto: FindCourseSourceDto;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        HttpModule.registerAsync({
          useClass: SalesforceApiHttpConfigService,
        }),
      ],
      providers: [
        LoggableLogger,
        {
          provide: CourseSourceRepository,
          useClass: SalesforceApiCourseSourceRepository,
        },
        {
          provide: CourseSourceRepositoryErrorFactory,
          useClass: SalesforceApiRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<CourseSourceRepository>(
      CourseSourceRepository
    ) as SalesforceApiCourseSourceRepository;
  });

  test('Successfully find one course source', ({ given, and, when, then }) => {
    let result: CourseSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record exists at the source', async () => {
      // this is the simpler version
      // I know this ID exists, it'll do for now
      findCourseSourceDto = {
        id: '5009s000001uq8iAAA' as CourseSourceId,
      };
    });

    when('I request the source by ID', async () => {
      try {
        result = await executeTask(repository.findOne(findCourseSourceDto));
      } catch (err) {
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('a source corresponding to that ID should be returned', () => {
      expect(result.id).toEqual(findCourseSourceDto.id);
    });
  });

  // test('Fail; Source not found for ID provided', ({
  //   given,
  //   and,
  //   when,
  //   then,
  // }) => {
  //   let absentCourseSource: CourseSource;
  //   let result: CourseSource;
  //   let error: Error;

  //   given('I am authorised to access the source', () => {
  //     // assumed
  //   });

  //   and('a matching record DOES NOT exist at the source', () => {
  //     absentCourseSource = CourseSourceBuilder().noMatchingSource().build();
  //     findCourseSourceDto = {
  //       id: absentCourseSource.id,
  //     };
  //   });

  //   when('I request the source by ID', async () => {
  //     try {
  //       result = await executeTask(repository.findOne(findCourseSourceDto));
  //     } catch (err) {
  //       error = err;
  //     }
  //   });

  //   then('I should receive an Error', () => {
  //     expect(error).toBeInstanceOf(Error);
  //   });

  //   and('no result is returned', () => {
  //     expect(result).toBeUndefined();
  //   });
  // });
});
