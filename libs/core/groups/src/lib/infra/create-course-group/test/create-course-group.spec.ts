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

import { CourseGroupModule } from '../../../test/course-group.module.fake';
import { MutateCourseGroupModule } from '../../../mutate-course-group.module';
import { CreateCourseGroupRequestDto } from '../dto/create-course-group.request.dto';
import { CourseGroup } from '../../../domain/entities/course-group';
import { GroupBuilder } from '../../../test/builders/group.builder';
import { CreateCourseGroupController } from '../../../infra/create-course-group/create-course-group.controller';
import { FakeCourseGroupRepository } from '../../../adapter/implementations/fake/fake.course-group.repository';
import { CourseGroupRepository } from '../../../adapter/ports/course-group.repository';

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

const feature = loadFeature('./create-course-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeCourseGroupRepository;
  let controller: CreateCourseGroupController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CourseGroupModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    MutateCourseGroupModule.applyDefaults(app);
    repository = moduleRef.get<CourseGroupRepository>(
      CourseGroupRepository
    ) as FakeCourseGroupRepository;
    controller = moduleRef.get<CreateCourseGroupController>(
      CreateCourseGroupController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a course group', ({ given, and, when, then }) => {
    let groups: CourseGroup[];
    let groupsBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let createCourseGroupDto: CreateCourseGroupRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createCourseGroupDto = GroupBuilder()
        .alpha()
        .buildCreateCourseGroupRequestDto();

      groups = await executeTask(repository.all());
      groupsBefore = groups.length;
    });

    when('I attempt to create a group', async () => {
      try {
        result = await controller.create(createCourseGroupDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a new record should have been created', async () => {
      groups = await executeTask(repository.all());
      expect(groups.length).toEqual(groupsBefore + 1);
    });

    and('saved group is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let createCourseGroupDto: CreateCourseGroupRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      createCourseGroupDto = GroupBuilder()
        .invalidOther()
        .buildCreateCourseGroupRequestDto();
    });

    when('I attempt to create a group', async () => {
      try {
        await controller.create(createCourseGroupDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
