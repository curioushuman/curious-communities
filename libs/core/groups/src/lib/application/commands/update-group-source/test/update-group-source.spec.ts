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
  UpdateGroupSourceCommand,
  UpdateGroupSourceHandler,
} from '../update-group-source.command';
import {
  GroupSourceCommunityRepository,
  GroupSourceMicroCourseRepository,
} from '../../../../adapter/ports/group-source.repository';
import { FakeGroupSourceCommunityRepository } from '../../../../adapter/implementations/fake/fake.group-source.community.repository';
import { FakeGroupSourceMicroCourseRepository } from '../../../../adapter/implementations/fake/fake.group-source.micro-course.repository';
import { GroupSource } from '../../../../domain/entities/group-source';
import { GroupSourceBuilder } from '../../../../test/builders/group-source.builder';
import { UpdateGroupSourceDto } from '../update-group-source.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-group-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupSourceCommunityRepository;
  let handler: UpdateGroupSourceHandler;
  let updateGroupSourceDto: UpdateGroupSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateGroupSourceHandler,
        LoggableLogger,
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

    repository = moduleRef.get<GroupSourceCommunityRepository>(
      GroupSourceCommunityRepository
    ) as FakeGroupSourceCommunityRepository;
    handler = moduleRef.get<UpdateGroupSourceHandler>(UpdateGroupSourceHandler);
  });

  test('Successfully updating a group source', ({ given, and, when, then }) => {
    let groupSourceBefore: GroupSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      updateGroupSourceDto = GroupSourceBuilder().buildUpdateGroupSourceDto();
    });

    and('a matching record is found at the source', async () => {
      // we'll grab the groupSource before the update
      groupSourceBefore = await executeTask(
        repository.findOneById(updateGroupSourceDto.groupSource.id)
      );
    });

    when('I attempt to update a group source', async () => {
      result = await handler.execute(
        new UpdateGroupSourceCommand(updateGroupSourceDto)
      );
    });

    then('a record should have been updated', async () => {
      const groupSources = await executeTask(repository.all());
      const groupSourceAfter = groupSources.find(
        (groupSource) => groupSource.id === updateGroupSourceDto.groupSource.id
      );
      expect(groupSourceAfter).toBeDefined();
      if (groupSourceAfter) {
        expect(groupSourceAfter.status).not.toEqual(groupSourceBefore.status);
      }
    });

    and('saved group source is returned', () => {
      expect(result.id).toEqual(updateGroupSourceDto.groupSource.id);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      updateGroupSourceDto =
        GroupSourceBuilder().buildInvalidUpdateGroupSourceDto();
    });

    when('I attempt to update a group source', async () => {
      try {
        await handler.execute(
          new UpdateGroupSourceCommand(updateGroupSourceDto)
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
