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

import { MemberModule } from '../../../test/member.module.fake';
import { MutateMemberModule } from '../../../mutate-member.module';
import { CreateMemberRequestDto } from '../dto/create-member.request.dto';
import { Member } from '../../../domain/entities/member';
import { MemberBuilder } from '../../../test/builders/member.builder';
import { CreateMemberController } from '../../../infra/create-member/create-member.controller';
import { FakeMemberRepository } from '../../../adapter/implementations/fake/fake.member.repository';
import { MemberRepository } from '../../../adapter/ports/member.repository';

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

const feature = loadFeature('./create-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeMemberRepository;
  let controller: CreateMemberController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    MutateMemberModule.applyDefaults(app);
    repository = moduleRef.get<MemberRepository>(
      MemberRepository
    ) as FakeMemberRepository;
    controller = moduleRef.get<CreateMemberController>(CreateMemberController);
  });

  afterAll(async () => {
    await app.close();
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
    let createMemberDto: CreateMemberRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createMemberDto = MemberBuilder()
        .alpha()
        .buildCreateByIdSourceValueMemberRequestDto();

      members = await executeTask(repository.all());
      membersBefore = members.length;
    });

    when('I attempt to create a member', async () => {
      try {
        result = await controller.create(createMemberDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
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
    let createMemberDto: CreateMemberRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createMemberDto = MemberBuilder()
        .beta()
        .buildCreateByEmailMemberRequestDto();

      members = await executeTask(repository.all());
      membersBefore = members.length;
    });

    when('I attempt to create a member', async () => {
      try {
        result = await controller.create(createMemberDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
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
    let createMemberDto: CreateMemberRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      createMemberDto = MemberBuilder()
        .invalid()
        .buildCreateByIdSourceValueMemberRequestDto();
    });

    when('I attempt to create a member', async () => {
      try {
        await controller.create(createMemberDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
