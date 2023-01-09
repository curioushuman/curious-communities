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

import { GroupModule } from '../../../test/group.module.fake';
import { MutateGroupModule } from '../../../mutate-group.module';
import { CreateGroupRequestDto } from '../dto/create-group.request.dto';
import { Group } from '../../../domain/entities/group';
import { GroupBuilder } from '../../../test/builders/group.builder';
import { CreateGroupController } from '../../../infra/create-group/create-group.controller';
import { FakeGroupRepository } from '../../../adapter/implementations/fake/fake.group.repository';
import { GroupRepository } from '../../../adapter/ports/group.repository';

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

const feature = loadFeature('./create-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeGroupRepository;
  let controller: CreateGroupController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    MutateGroupModule.applyDefaults(app);
    repository = moduleRef.get<GroupRepository>(
      GroupRepository
    ) as FakeGroupRepository;
    controller = moduleRef.get<CreateGroupController>(CreateGroupController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a group by Source Id', ({
    given,
    and,
    when,
    then,
  }) => {
    let groups: Group[];
    let groupsBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let createGroupDto: CreateGroupRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createGroupDto = GroupBuilder()
        .alpha()
        .buildCreateByIdSourceValueGroupRequestDto();

      groups = await executeTask(repository.all());
      groupsBefore = groups.length;
    });

    when('I attempt to create a group', async () => {
      try {
        result = await controller.create(createGroupDto);
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
    let createGroupDto: CreateGroupRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      createGroupDto = GroupBuilder()
        .invalid()
        .buildCreateByIdSourceValueGroupRequestDto();
    });

    when('I attempt to create a group', async () => {
      try {
        await controller.create(createGroupDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
