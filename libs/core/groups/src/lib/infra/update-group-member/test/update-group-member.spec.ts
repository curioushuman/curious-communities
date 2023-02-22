import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { GroupMemberModule } from '../../../test/group-member.module.fake';
import { GroupMemberBuilder } from '../../../test/builders/group-member.builder';
import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../../../adapter/implementations/fake/fake.group-member.repository';
import { UpdateGroupMemberController } from '../update-group-member.controller';
import { UpdateGroupMemberRequestDto } from '../dto/update-group-member.request.dto';
import { MemberBuilder } from '../../../test/builders/member.builder';

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
  let controller: UpdateGroupMemberController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupMemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    GroupMemberModule.applyDefaults(app);
    repository = moduleRef.get<GroupMemberRepository>(
      GroupMemberRepository
    ) as FakeGroupMemberRepository;
    controller = moduleRef.get<UpdateGroupMemberController>(
      UpdateGroupMemberController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully updating a group member', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateGroupMemberDto: UpdateGroupMemberRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      updateGroupMemberDto = GroupMemberBuilder()
        .updated()
        .buildUpdateGroupMemberRequestDto();
      // ! the builder structure has reached its current limit
      // TODO: refactor the builder to allow for more flexibility
      updateGroupMemberDto.groupMember.group.id =
        '6fce9d10-aeed-4bb1-8c8c-92094f1983ff';
      updateGroupMemberDto.groupMember.groupId =
        updateGroupMemberDto.groupMember.group.id;
      updateGroupMemberDto.groupMember.member.id =
        '4bc22e84-8b56-4b82-b6cd-44864792526e';
      updateGroupMemberDto.groupMember.memberId =
        updateGroupMemberDto.groupMember.member.id;
    });

    and('the group member exists in the repository', async () => {
      const groupMembers = await executeTask(repository.all());
      const groupMemberBefore = groupMembers.find(
        (groupMember) => updateGroupMemberDto.groupMember.id === groupMember.id
      );
      expect(groupMemberBefore).toBeDefined();
      if (groupMemberBefore) {
        expect(groupMemberBefore.status).not.toEqual(
          updateGroupMemberDto.groupMember.status
        );
      }
    });

    when('I attempt to update a group member', async () => {
      try {
        result = await controller.update(updateGroupMemberDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'an existing record should have been updated in the repository',
      async () => {
        const groupMembers = await executeTask(repository.all());
        const groupMemberAfter = groupMembers.find(
          (groupMember) =>
            updateGroupMemberDto.groupMember.id === groupMember.id
        );
        expect(groupMemberAfter).toBeDefined();
        if (groupMemberAfter) {
          expect(groupMemberAfter.status).toEqual(
            updateGroupMemberDto.groupMember.status
          );
        }
      }
    );

    and('saved group member is returned within payload', () => {
      expect(result.detail.id).toBeDefined();
      expect(result.event).toEqual('updated');
      expect(result.outcome).toEqual('success');
    });
  });

  test('Fail; Group does not exist', ({ given, and, when, then }) => {
    let updateGroupMemberDto: UpdateGroupMemberRequestDto;
    let error: Error;

    given('the request is valid', () => {
      updateGroupMemberDto = GroupMemberBuilder()
        .updatedAlpha()
        .buildUpdateGroupMemberRequestDto();
    });

    and('the group does not exist in the repository', () => {
      // this should be in the builder but... needs must (for now)
      // TODO: add this to the builder
      updateGroupMemberDto.groupMember.groupId = 'does-not-exist';
    });

    when('I attempt to update a group member', async () => {
      try {
        await controller.update(updateGroupMemberDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });

  test('Fail; Group member does not exist', ({ given, and, when, then }) => {
    let updateGroupMemberDto: UpdateGroupMemberRequestDto;
    let error: Error;

    given('the request is valid', () => {
      const memberDto = MemberBuilder().doesntExist().buildDto();
      updateGroupMemberDto = GroupMemberBuilder()
        .updatedAlpha()
        .buildUpdateGroupMemberRequestDto(memberDto);
    });

    and('the group member does not exist in the repository', () => {
      // above
    });

    when('I attempt to update a group member', async () => {
      try {
        await controller.update(updateGroupMemberDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });

  // test('Fail; Invalid request', ({ given, when, then }) => {
  //   let updateGroupMemberDto: UpdateGroupMemberRequestDto;
  //   let error: Error;

  //   given('the request contains invalid data', () => {
  //     updateGroupMemberDto = GroupMemberBuilder()
  //       .invalid()
  //       .buildUpdateGroupMemberRequestDto();
  //   });

  //   when('I attempt to create a group member', async () => {
  //     try {
  //       await controller.update(updateGroupMemberDto);
  //     } catch (err) {
  //       error = err as Error;
  //     }
  //   });

  //   then('I should receive a RequestInvalidError', () => {
  //     expect(error).toBeInstanceOf(RequestInvalidError);
  //   });
  // });
});
