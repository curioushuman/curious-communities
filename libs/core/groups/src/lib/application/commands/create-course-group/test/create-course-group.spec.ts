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
  CreateCourseGroupCommand,
  CreateCourseGroupHandler,
} from '../create-course-group.command';
import { CourseGroupRepository } from '../../../../adapter/ports/course-group.repository';
import { FakeCourseGroupRepository } from '../../../../adapter/implementations/fake/fake.course-group.repository';
import { CourseGroup } from '../../../../domain/entities/course-group';
import { GroupBuilder } from '../../../../test/builders/group.builder';
import { CreateCourseGroupDto } from '../create-course-group.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-course-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeCourseGroupRepository;
  let handler: CreateCourseGroupHandler;
  let createCourseGroupDto: CreateCourseGroupDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCourseGroupHandler,
        LoggableLogger,
        { provide: CourseGroupRepository, useClass: FakeCourseGroupRepository },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<CourseGroupRepository>(
      CourseGroupRepository
    ) as FakeCourseGroupRepository;
    handler = moduleRef.get<CreateCourseGroupHandler>(CreateCourseGroupHandler);
  });

  test('Successfully creating a course group', ({ given, and, when, then }) => {
    let groups: CourseGroup[];
    let groupsBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createCourseGroupDto = GroupBuilder().alpha().buildCreateCourseGroupDto();

      groups = await executeTask(repository.all());
      groupsBefore = groups.length;
    });

    when('I attempt to create a group', async () => {
      result = await handler.execute(
        new CreateCourseGroupCommand(createCourseGroupDto)
      );
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
    let error: Error;

    given('the request contains invalid data', () => {
      createCourseGroupDto = GroupBuilder()
        .invalidOther()
        .buildCreateCourseGroupDto();
    });

    when('I attempt to create a group', async () => {
      try {
        await handler.execute(
          new CreateCourseGroupCommand(createCourseGroupDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      // TODO: this should be a RequestInvalidError
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
