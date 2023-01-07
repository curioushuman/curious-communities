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
  CreateMemberCommand,
  CreateMemberHandler,
} from '../create-member.command';
import { MemberRepository } from '../../../../adapter/ports/member.repository';
import { FakeMemberRepository } from '../../../../adapter/implementations/fake/fake.member.repository';
import {
  MemberSourceAuthRepository,
  MemberSourceCommunityRepository,
  MemberSourceCrmRepository,
  MemberSourceMicroCourseRepository,
} from '../../../../adapter/ports/member-source.repository';
import { Member } from '../../../../domain/entities/member';
import { MemberBuilder } from '../../../../test/builders/member.builder';
import { CreateMemberDto } from '../create-member.dto';
import { FakeMemberSourceAuthRepository } from '../../../../adapter/implementations/fake/fake.member-source.auth.repository';
import { FakeMemberSourceCrmRepository } from '../../../../adapter/implementations/fake/fake.member-source.crm.repository';
import { FakeMemberSourceCommunityRepository } from '../../../../adapter/implementations/fake/fake.member-source.community.repository';
import { FakeMemberSourceMicroCourseRepository } from '../../../../adapter/implementations/fake/fake.member-source.micro-course.repository';

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
          provide: MemberSourceCrmRepository,
          useClass: FakeMemberSourceCrmRepository,
        },
        {
          provide: MemberSourceAuthRepository,
          useClass: FakeMemberSourceAuthRepository,
        },
        {
          provide: MemberSourceCommunityRepository,
          useClass: FakeMemberSourceCommunityRepository,
        },
        {
          provide: MemberSourceMicroCourseRepository,
          useClass: FakeMemberSourceMicroCourseRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<MemberRepository>(
      MemberRepository
    ) as FakeMemberRepository;
    handler = moduleRef.get<CreateMemberHandler>(CreateMemberHandler);
  });

  test('Successfully creating a member by Source Id', ({
    given,
    and,
    when,
    then,
  }) => {
    let members: Member[];
    let membersBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createMemberDto = MemberBuilder()
        .alpha()
        .buildCreateByIdSourceValueMemberDto();

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

  test('Successfully creating a member by email', ({
    given,
    and,
    when,
    then,
  }) => {
    let members: Member[];
    let membersBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createMemberDto = MemberBuilder().beta().buildCreateByEmailMemberDto();

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
      createMemberDto = MemberBuilder()
        .invalid()
        .buildCreateByIdSourceValueMemberDto();
    });

    when('I attempt to create a member', async () => {
      try {
        await handler.execute(new CreateMemberCommand(createMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
