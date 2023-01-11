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
  UpdateGroupMemberSourceCommand,
  UpdateGroupMemberSourceHandler,
} from '../update-group-member-source.command';
import {
  GroupMemberSourceCommunityRepository,
  GroupMemberSourceMicroCourseRepository,
} from '../../../../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceCommunityRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.community.repository';
import { FakeGroupMemberSourceMicroCourseRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.micro-course.repository';
import { GroupMemberSource } from '../../../../domain/entities/group-member-source';
import { GroupMemberSourceBuilder } from '../../../../test/builders/group-member-source.builder';
import { UpdateGroupMemberSourceDto } from '../update-group-member-source.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-group-member-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupMemberSourceCommunityRepository;
  let handler: UpdateGroupMemberSourceHandler;
  let updateGroupMemberSourceDto: UpdateGroupMemberSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateGroupMemberSourceHandler,
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
    handler = moduleRef.get<UpdateGroupMemberSourceHandler>(
      UpdateGroupMemberSourceHandler
    );
  });

  test('Successfully updating a group source', ({ given, and, when, then }) => {
    let groupMemberSourceBefore: GroupMemberSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      updateGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildUpdateGroupMemberSourceDto();
    });

    and('a matching record is found at the source', async () => {
      // we'll grab the groupMemberSource before the update
      groupMemberSourceBefore = await executeTask(
        repository.findOneById(updateGroupMemberSourceDto.groupMemberSource.id)
      );
    });

    when('I attempt to update a group source', async () => {
      result = await handler.execute(
        new UpdateGroupMemberSourceCommand(updateGroupMemberSourceDto)
      );
    });

    then('a record should have been updated', async () => {
      const groupMemberSources = await executeTask(repository.all());
      const groupMemberSourceAfter = groupMemberSources.find(
        (groupMemberSource) =>
          groupMemberSource.id ===
          updateGroupMemberSourceDto.groupMemberSource.id
      );
      expect(groupMemberSourceAfter).toBeDefined();
      if (groupMemberSourceAfter) {
        expect(groupMemberSourceAfter.status).not.toEqual(
          groupMemberSourceBefore.status
        );
      }
    });

    and('saved group source is returned', () => {
      expect(result.id).toEqual(
        updateGroupMemberSourceDto.groupMemberSource.id
      );
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      updateGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildInvalidUpdateGroupMemberSourceDto();
    });

    when('I attempt to update a group source', async () => {
      try {
        await handler.execute(
          new UpdateGroupMemberSourceCommand(updateGroupMemberSourceDto)
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
