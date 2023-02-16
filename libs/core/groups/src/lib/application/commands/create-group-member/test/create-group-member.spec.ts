import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import { FakeRepositoryErrorFactory } from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateGroupMemberCommand,
  CreateGroupMemberHandler,
} from '../create-group-member.command';
import { GroupMemberRepository } from '../../../../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../../../../adapter/implementations/fake/fake.group-member.repository';
import { GroupMemberSourceRepositoryReadWrite } from '../../../../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.repository';
import { GroupMember } from '../../../../domain/entities/group-member';
import { GroupMemberBuilder } from '../../../../test/builders/group-member.builder';
import { CreateGroupMemberDto } from '../create-group-member.dto';
import { GroupMemberRepositoryErrorFactory } from '../../../../adapter/ports/group-member.repository.error-factory';
import { GroupMemberSourceRepositoryErrorFactory } from '../../../../adapter/ports/group-member-source.repository.error-factory';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupMemberRepository;
  let handler: CreateGroupMemberHandler;
  let createGroupMemberDto: CreateGroupMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGroupMemberHandler,
        LoggableLogger,
        { provide: GroupMemberRepository, useClass: FakeGroupMemberRepository },
        {
          provide: GroupMemberSourceRepositoryReadWrite,
          useClass: FakeGroupMemberSourceRepository,
        },
        {
          provide: GroupMemberRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
        {
          provide: GroupMemberSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupMemberRepository>(
      GroupMemberRepository
    ) as FakeGroupMemberRepository;
    handler = moduleRef.get<CreateGroupMemberHandler>(CreateGroupMemberHandler);
  });

  test('Successfully creating a group member from course', ({
    given,
    and,
    when,
    then,
  }) => {
    let groupMembers: GroupMember[];
    let groupMembersBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      createGroupMemberDto =
        GroupMemberBuilder().buildCreateCourseGroupMemberDto();
    });

    and('the returned source populates a valid group member', () => {
      // we know this to be true
      // out of scope for this test
    });

    and('the source does not already exist in our DB', async () => {
      groupMembers = await executeTask(repository.all());
      groupMembersBefore = groupMembers.length;
    });

    when('I attempt to create a group member', async () => {
      result = await handler.execute(
        new CreateGroupMemberCommand(createGroupMemberDto)
      );
    });

    then('a new record should have been created', async () => {
      groupMembers = await executeTask(repository.all());
      expect(groupMembers.length).toEqual(groupMembersBefore + 1);
    });

    and('saved group member is returned', () => {
      expect(result.id).toBeDefined();
    });
  });
});
