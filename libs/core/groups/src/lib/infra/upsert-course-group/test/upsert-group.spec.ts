import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { RequestInvalidError } from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { GroupModule } from '../../../test/group.module.fake';
import { Group } from '../../../domain/entities/group';
import { GroupBuilder } from '../../../test/builders/group.builder';
import { FakeGroupRepository } from '../../../adapter/implementations/fake/fake.group.repository';
import { GroupRepository } from '../../../adapter/ports/group.repository';
import { UpsertCourseGroupController } from '../upsert-course-group.controller';
import { UpsertCourseGroupRequestDto } from '../dto/upsert-course-group.request.dto';

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

const feature = loadFeature('./upsert-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeGroupRepository;
  let controller: UpsertCourseGroupController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    GroupModule.applyDefaults(app);
    repository = moduleRef.get<GroupRepository>(
      GroupRepository
    ) as FakeGroupRepository;
    controller = moduleRef.get<UpsertCourseGroupController>(
      UpsertCourseGroupController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a group', ({ given, and, when, then }) => {
    let groups: Group[];
    let groupsBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let createGroupDto: UpsertCourseGroupRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createGroupDto = GroupBuilder().beta().buildCreateCourseGroupRequestDto();
    });

    and('the group does not exist in the repository', async () => {
      groups = await executeTask(repository.all());
      groupsBefore = groups.length;
    });

    when('I attempt to upsert a group', async () => {
      try {
        result = await controller.upsert(createGroupDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'a new record should have been created in the repository',
      async () => {
        groups = await executeTask(repository.all());
        expect(groups.length).toEqual(groupsBefore + 1);
      }
    );

    and('saved group is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully updating a group', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateGroupDto: UpsertCourseGroupRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      updateGroupDto = GroupBuilder()
        .updated()
        .buildUpdateCourseGroupRequestDto();
    });

    and('the group exists in the repository', async () => {
      const groups = await executeTask(repository.all());
      const groupBefore = groups.find(
        (group) =>
          'courseId' in group && updateGroupDto.course.id === group.courseId
      );
      expect(groupBefore).toBeDefined();
      if (groupBefore) {
        expect(groupBefore.name).not.toEqual(updateGroupDto.course.name);
      }
    });

    when('I attempt to upsert a group', async () => {
      try {
        result = await controller.upsert(updateGroupDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'an existing record should have been updated in the repository',
      async () => {
        const groups = await executeTask(repository.all());
        const groupAfter = groups.find(
          (group) =>
            'courseId' in group && updateGroupDto.course.id === group.courseId
        );
        expect(groupAfter).toBeDefined();
        if (groupAfter) {
          expect(groupAfter.name).toEqual(updateGroupDto.course.name);
        }
      }
    );

    and('saved group is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let createGroupDto: UpsertCourseGroupRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      createGroupDto = GroupBuilder()
        .invalidOther()
        .buildCreateCourseGroupRequestDto();
    });

    when('I attempt to create a group', async () => {
      try {
        await controller.upsert(createGroupDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
