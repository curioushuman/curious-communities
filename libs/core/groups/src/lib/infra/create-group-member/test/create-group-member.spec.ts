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

import { GroupMemberModule } from '../../../test/group-member.module.fake';
import { CreateGroupMemberModule } from '../../../create-group-member.module';
import { CreateGroupMemberRequestDto } from '../dto/create-group-member.request.dto';
import { GroupMember } from '../../../domain/entities/group-member';
import { GroupMemberBuilder } from '../../../test/builders/group-member.builder';
import { CreateGroupMemberController } from '../../../infra/create-group-member/create-group-member.controller';
import { FakeGroupMemberRepository } from '../../../adapter/implementations/fake/fake.group-member.repository';
import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';

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

const feature = loadFeature('./create-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeGroupMemberRepository;
  let controller: CreateGroupMemberController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupMemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    CreateGroupMemberModule.applyDefaults(app);
    repository = moduleRef.get<GroupMemberRepository>(
      GroupMemberRepository
    ) as FakeGroupMemberRepository;
    controller = moduleRef.get<CreateGroupMemberController>(
      CreateGroupMemberController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a group-member', ({ given, and, when, then }) => {
    let groupMembers: GroupMember[];
    let groupMembersBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let createGroupMemberDto: CreateGroupMemberRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      createGroupMemberDto = GroupMemberBuilder()
        .beta()
        .buildCreateGroupMemberRequestDto();
    });

    and('a matching record is found at the source', async () => {
      groupMembers = await executeTask(repository.all());
      groupMembersBefore = groupMembers.length;
    });

    when('I attempt to create a group-member', async () => {
      try {
        result = await controller.create(createGroupMemberDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'a new record should have been created in the repository',
      async () => {
        groupMembers = await executeTask(repository.all());
        expect(groupMembers.length).toEqual(groupMembersBefore + 1);
      }
    );

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });

  test('Fail; Invalid request', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let createGroupMemberDto: CreateGroupMemberRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      createGroupMemberDto = GroupMemberBuilder()
        .invalid()
        .buildCreateGroupMemberRequestDto();
    });

    when('I attempt to create a group-member', async () => {
      try {
        result = await controller.create(createGroupMemberDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });
});
