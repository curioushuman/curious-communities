import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  InternalRequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateMemberCommand,
  CreateMemberHandler,
} from '../create-member.command';
import { MemberRepository } from '../../../../adapter/ports/member.repository';
import { FakeMemberRepository } from '../../../../adapter/implementations/fake/fake.member.repository';
import { Member } from '../../../../domain/entities/member';
import { MemberBuilder } from '../../../../test/builders/member.builder';
import { CreateMemberDto } from '../create-member.dto';
import { MemberRepositoryErrorFactory } from '../../../../adapter/ports/member.repository.error-factory';
import { MemberSourceRepositoryReadWrite } from '../../../../adapter/ports/member-source.repository';
import { FakeMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.member-source.repository';
import { MemberSourceRepositoryErrorFactory } from '../../../../adapter/ports/member-source.repository.error-factory';
import { MemberSourceBuilder } from '../../../../test/builders/member-source.builder';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeMemberRepository;
  let handler: CreateMemberHandler;
  let createMemberDto: CreateMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMemberHandler,
        LoggableLogger,
        { provide: MemberRepository, useClass: FakeMemberRepository },
        {
          provide: MemberSourceRepositoryReadWrite,
          useClass: FakeMemberSourceRepository,
        },
        {
          provide: MemberRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
        {
          provide: MemberSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<MemberRepository>(
      MemberRepository
    ) as FakeMemberRepository;
    handler = moduleRef.get<CreateMemberHandler>(CreateMemberHandler);
  });

  test('Successfully creating a member', ({ given, and, when, then }) => {
    let members: Member[];
    let membersBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      createMemberDto = MemberBuilder().alpha().buildCreateMemberDto();

      members = await executeTask(repository.all());
      membersBefore = members.length;
    });

    when('I attempt to create a member', async () => {
      result = await handler.execute(new CreateMemberCommand(createMemberDto));
    });

    then('a new record should have been created', async () => {
      members = await executeTask(repository.all());
      expect(members.length).toEqual(membersBefore + 1);
    });

    and('saved member is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      const invalidSource = MemberSourceBuilder().invalid().buildNoCheck();
      createMemberDto = MemberBuilder()
        .invalidSource()
        .buildCreateMemberDto(invalidSource);
    });

    when('I attempt to create a member', async () => {
      try {
        await handler.execute(new CreateMemberCommand(createMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a InternalRequestInvalidError', () => {
      expect(error).toBeInstanceOf(InternalRequestInvalidError);
    });
  });
});
