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
import { UpdateGroupMemberModule } from '../../../update-group-member.module';
import { UpdateGroupMemberRequestDto } from '../dto/update-group-member.request.dto';
import { GroupMemberBuilder } from '../../../test/builders/group-member.builder';
import { UpdateGroupMemberController } from '../update-group-member.controller';
import { FakeGroupMemberRepository } from '../../../adapter/implementations/fake/fake.group-member.repository';
import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';
import { GroupMemberSourceBuilder } from '../../../test/builders/group-member-source.builder';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { GroupMemberSourceRepository } from '../../../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceRepository } from '../../../adapter/implementations/fake/fake.group-member-source.repository';

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

const feature = loadFeature('./update-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeGroupMemberRepository;
  let GroupMemberSourcerepository: FakeGroupMemberSourceRepository;
  let controller: UpdateGroupMemberController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupMemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    UpdateGroupMemberModule.applyDefaults(app);
    repository = moduleRef.get<GroupMemberRepository>(
      GroupMemberRepository
    ) as FakeGroupMemberRepository;
    GroupMemberSourcerepository = moduleRef.get<GroupMemberSourceRepository>(
      GroupMemberSourceRepository
    ) as FakeGroupMemberSourceRepository;
    controller = moduleRef.get<UpdateGroupMemberController>(
      UpdateGroupMemberController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully updating a group-member', ({ given, and, when, then }) => {
    let updatedGroupMemberSource: GroupMemberSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateGroupMemberDto: UpdateGroupMemberRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      updateGroupMemberDto = GroupMemberBuilder()
        .exists()
        .buildUpdateGroupMemberRequestDto();
    });

    and('a matching record is found at the source', async () => {
      updatedGroupMemberSource = GroupMemberSourceBuilder().updated().build();
      // save it to our fake repo
      executeTask(GroupMemberSourcerepository.save(updatedGroupMemberSource));
      const groupMembers = await executeTask(repository.all());
      const groupMemberBefore = groupMembers.find(
        (groupMember) => groupMember.id === updateGroupMemberDto.id
      );
      expect(groupMemberBefore).toBeDefined();
      if (groupMemberBefore) {
        expect(groupMemberBefore.memberName).not.toEqual(
          updatedGroupMemberSource.memberName
        );
      }
    });

    when('I attempt to update a group-member', async () => {
      try {
        result = await controller.update(updateGroupMemberDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'the related record should have been updated in the repository',
      async () => {
        const groupMembers = await executeTask(repository.all());
        const groupMemberAfter = groupMembers.find(
          (groupMember) => groupMember.id === updateGroupMemberDto.id
        );
        expect(groupMemberAfter).toBeDefined();
        if (groupMemberAfter) {
          expect(groupMemberAfter.memberName).toEqual(
            updatedGroupMemberSource.memberName
          );
        }
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
    let updateGroupMemberDto: UpdateGroupMemberRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      updateGroupMemberDto = GroupMemberBuilder()
        .invalid()
        .buildUpdateGroupMemberRequestDto();
    });

    when('I attempt to update a group-member', async () => {
      try {
        result = await controller.update(updateGroupMemberDto);
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
