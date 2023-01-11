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
  CreateGroupMemberSourceCommand,
  CreateGroupMemberSourceHandler,
} from '../create-group-member-source.command';
import {
  GroupMemberSourceCommunityRepository,
  GroupMemberSourceMicroCourseRepository,
} from '../../../../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceCommunityRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.community.repository';
import { FakeGroupMemberSourceMicroCourseRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.micro-course.repository';
import { GroupMemberSource } from '../../../../domain/entities/group-member-source';
import { GroupMemberSourceBuilder } from '../../../../test/builders/group-member-source.builder';
import { CreateGroupMemberSourceDto } from '../create-group-member-source.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-group-member-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupMemberSourceCommunityRepository;
  let handler: CreateGroupMemberSourceHandler;
  let createGroupMemberSourceDto: CreateGroupMemberSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGroupMemberSourceHandler,
        LoggableLogger,
        {
          provide: GroupMemberSourceCommunityRepository,
          useClass: FakeGroupMemberSourceCommunityRepository,
        },
        {
          provide: GroupMemberSourceMicroCourseRepository,
          useClass: FakeGroupMemberSourceMicroCourseRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupMemberSourceCommunityRepository>(
      GroupMemberSourceCommunityRepository
    ) as FakeGroupMemberSourceCommunityRepository;
    handler = moduleRef.get<CreateGroupMemberSourceHandler>(
      CreateGroupMemberSourceHandler
    );
  });

  test('Successfully creating a group source', ({ given, and, when, then }) => {
    let groupSources: GroupMemberSource[];
    let groupSourcesBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      createGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildCreateGroupMemberSourceDto();

      groupSources = await executeTask(repository.all());
      groupSourcesBefore = groupSources.length;
    });

    when('I attempt to create a group source', async () => {
      result = await handler.execute(
        new CreateGroupMemberSourceCommand(createGroupMemberSourceDto)
      );
    });

    then('a new record should have been created', async () => {
      groupSources = await executeTask(repository.all());
      expect(groupSources.length).toEqual(groupSourcesBefore + 1);
    });

    and('saved group source is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      createGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildInvalidCreateGroupMemberSourceDto();
    });

    when('I attempt to create a group source', async () => {
      try {
        await handler.execute(
          new CreateGroupMemberSourceCommand(createGroupMemberSourceDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
