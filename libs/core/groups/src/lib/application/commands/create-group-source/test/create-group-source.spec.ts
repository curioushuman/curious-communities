import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  InternalRequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateGroupSourceCommand,
  CreateGroupSourceHandler,
} from '../create-group-source.command';
import { GroupSourceRepositoryReadWrite } from '../../../../adapter/ports/group-source.repository';
import { GroupSource } from '../../../../domain/entities/group-source';
import { GroupSourceBuilder } from '../../../../test/builders/group-source.builder';
import { CreateGroupSourceDto } from '../create-group-source.dto';
import { FakeGroupSourceRepository } from '../../../../adapter/implementations/fake/fake.group-source.repository';
import { GroupSourceRepositoryErrorFactory } from '../../../../adapter/ports/group-source.repository.error-factory';
import { GroupBuilder } from '../../../../test/builders/group.builder';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-group-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupSourceRepository;
  let handler: CreateGroupSourceHandler;
  let createGroupSourceDto: CreateGroupSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGroupSourceHandler,
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
    handler = moduleRef.get<CreateGroupSourceHandler>(CreateGroupSourceHandler);
  });

  test('Successfully creating a group source', ({ given, and, when, then }) => {
    let groupSources: GroupSource[];
    let groupSourcesBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      createGroupSourceDto = GroupSourceBuilder().buildCreateGroupSourceDto();

      groupSources = await executeTask(repository.all());
      groupSourcesBefore = groupSources.length;
    });

    when('I attempt to create a group source', async () => {
      result = await handler.execute(
        new CreateGroupSourceCommand(createGroupSourceDto)
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
      const group = GroupBuilder().invalid().buildBase();
      createGroupSourceDto =
        GroupSourceBuilder().buildCreateGroupSourceDto(group);
    });

    when('I attempt to create a group source', async () => {
      try {
        await handler.execute(
          new CreateGroupSourceCommand(createGroupSourceDto)
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
