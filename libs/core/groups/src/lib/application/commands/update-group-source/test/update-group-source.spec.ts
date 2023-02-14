import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  InternalRequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  UpdateGroupSourceCommand,
  UpdateGroupSourceHandler,
} from '../update-group-source.command';
import { GroupSourceRepositoryReadWrite } from '../../../../adapter/ports/group-source.repository';
import { FakeGroupSourceRepository } from '../../../../adapter/implementations/fake/fake.group-source.repository';
import { GroupSource } from '../../../../domain/entities/group-source';
import { GroupSourceBuilder } from '../../../../test/builders/group-source.builder';
import { UpdateGroupSourceDto } from '../update-group-source.dto';
import { GroupSourceRepositoryErrorFactory } from '../../../../adapter/ports/group-source.repository.error-factory';
import config from '../../../../static/config';
import { GroupBuilder } from '../../../../test/builders/group.builder';

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
  let repository: FakeGroupSourceRepository;
  let handler: UpdateGroupSourceHandler;
  let updateGroupSourceDto: UpdateGroupSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateGroupSourceHandler,
        LoggableLogger,
        {
          provide: GroupSourceRepositoryReadWrite,
          useClass: FakeGroupSourceRepository,
        },
        {
          provide: GroupSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupSourceRepositoryReadWrite>(
      GroupSourceRepositoryReadWrite
    ) as FakeGroupSourceRepository;
    handler = moduleRef.get<UpdateGroupSourceHandler>(UpdateGroupSourceHandler);
  });

  test('Successfully updating a group source', ({ given, and, when, then }) => {
    let groupSourceBefore: GroupSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      updateGroupSourceDto = GroupSourceBuilder()
        .updated()
        .buildUpdateGroupSourceDto();
    });

    and('a matching record is found at the source', async () => {
      // we'll grab the groupSource before the update
      groupSourceBefore = await executeTask(
        repository.findOneByIdSource({
          id: updateGroupSourceDto.groupSource.id,
          source: config.defaults.primaryAccountSource,
        })
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
      const group = GroupBuilder().invalid().buildBase();
      updateGroupSourceDto = GroupSourceBuilder()
        .exists()
        .buildUpdateGroupSourceDto(group);
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

    then('I should receive a InternalRequestInvalidError', () => {
      expect(error).toBeInstanceOf(InternalRequestInvalidError);
    });
  });
});
