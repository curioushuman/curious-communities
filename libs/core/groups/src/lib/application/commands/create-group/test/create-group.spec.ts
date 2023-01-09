import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateGroupCommand,
  CreateGroupHandler,
} from '../create-group.command';
import { GroupRepository } from '../../../../adapter/ports/group.repository';
import { FakeGroupRepository } from '../../../../adapter/implementations/fake/fake.group.repository';
import {
  GroupSourceCommunityRepository,
  GroupSourceMicroCourseRepository,
} from '../../../../adapter/ports/group-source.repository';
import { Group } from '../../../../domain/entities/group';
import { GroupBuilder } from '../../../../test/builders/group.builder';
import { CreateGroupDto } from '../create-group.dto';
import { FakeGroupSourceCommunityRepository } from '../../../../adapter/implementations/fake/fake.group-source.community.repository';
import { FakeGroupSourceMicroCourseRepository } from '../../../../adapter/implementations/fake/fake.group-source.micro-course.repository';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupRepository;
  let handler: CreateGroupHandler;
  let createGroupDto: CreateGroupDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGroupHandler,
        LoggableLogger,
        { provide: GroupRepository, useClass: FakeGroupRepository },
        {
          provide: GroupSourceCommunityRepository,
          useClass: FakeGroupSourceCommunityRepository,
        },
        {
          provide: GroupSourceMicroCourseRepository,
          useClass: FakeGroupSourceMicroCourseRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupRepository>(
      GroupRepository
    ) as FakeGroupRepository;
    handler = moduleRef.get<CreateGroupHandler>(CreateGroupHandler);
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

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createGroupDto = GroupBuilder()
        .alpha()
        .buildCreateByIdSourceValueGroupDto();

      groups = await executeTask(repository.all());
      groupsBefore = groups.length;
    });

    when('I attempt to create a group', async () => {
      result = await handler.execute(new CreateGroupCommand(createGroupDto));
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
      createGroupDto = GroupBuilder()
        .invalid()
        .buildCreateByIdSourceValueGroupDto();
    });

    when('I attempt to create a group', async () => {
      try {
        await handler.execute(new CreateGroupCommand(createGroupDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
