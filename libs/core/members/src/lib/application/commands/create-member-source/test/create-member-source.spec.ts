import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateMemberSourceCommand,
  CreateMemberSourceHandler,
} from '../create-member-source.command';
import { MemberSourceRepositoryReadWrite } from '../../../../adapter/ports/member-source.repository';
import { MemberSource } from '../../../../domain/entities/member-source';
import { MemberSourceBuilder } from '../../../../test/builders/member-source.builder';
import { CreateMemberSourceDto } from '../create-member-source.dto';
import { FakeMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.member-source.repository';
import { MemberSourceRepositoryErrorFactory } from '../../../../adapter/ports/member-source.repository.error-factory';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-member-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeMemberSourceRepository;
  let handler: CreateMemberSourceHandler;
  let createMemberSourceDto: CreateMemberSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMemberSourceHandler,
        LoggableLogger,
        {
          provide: MemberSourceRepositoryReadWrite,
          useClass: FakeMemberSourceRepository,
        },
        {
          provide: MemberSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<MemberSourceRepositoryReadWrite>(
      MemberSourceRepositoryReadWrite
    ) as FakeMemberSourceRepository;
    handler = moduleRef.get<CreateMemberSourceHandler>(
      CreateMemberSourceHandler
    );
  });

  test('Successfully creating a member source', ({
    given,
    and,
    when,
    then,
  }) => {
    let memberSources: MemberSource[];
    let memberSourcesBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      createMemberSourceDto =
        MemberSourceBuilder().buildCreateMemberSourceDto();

      memberSources = await executeTask(repository.all());
      memberSourcesBefore = memberSources.length;
    });

    when('I attempt to create a member source', async () => {
      result = await handler.execute(
        new CreateMemberSourceCommand(createMemberSourceDto)
      );
    });

    then('a new record should have been created', async () => {
      memberSources = await executeTask(repository.all());
      expect(memberSources.length).toEqual(memberSourcesBefore + 1);
    });

    and('saved member source is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      createMemberSourceDto =
        MemberSourceBuilder().buildInvalidCreateMemberSourceDto();
    });

    when('I attempt to create a member source', async () => {
      try {
        await handler.execute(
          new CreateMemberSourceCommand(createMemberSourceDto)
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
