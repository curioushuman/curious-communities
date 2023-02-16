import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { RequestInvalidError } from '@curioushuman/error-factory';

import { GroupMemberModule } from '../../../test/group-member.module.fake';
import { GroupMemberSourceBuilder } from '../../../test/builders/group-member-source.builder';
import { UpsertGroupMemberSourceController } from '../../../infra/upsert-group-member-source/upsert-group-member-source.controller';
import { UpsertGroupMemberSourceRequestDto } from '../dto/upsert-group-member-source.request.dto';
import { FakeGroupMemberSourceRepository } from '../../../adapter/implementations/fake/fake.group-member-source.repository';
import { GroupMemberSourceRepositoryReadWrite } from '../../../adapter/ports/group-member-source.repository';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { GroupMemberBuilder } from '../../../test/builders/group-member.builder';
import { MemberBuilder } from '../../../test/builders/member.builder';

/**
 * INTEGRATION TEST
 * SUT = the controller, the query handler
 *
 * NOTES:
 * - the controller does so little, so rather than find a separate unit test
 *  for it, we'll just test it here
 *
 * TODO
 * - [ ] need to mock an error for internal error testing
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./upsert-group-member-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: UpsertGroupMemberSourceController;
  let repository: FakeGroupMemberSourceRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupMemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    GroupMemberModule.applyDefaults(app);
    controller = moduleRef.get<UpsertGroupMemberSourceController>(
      UpsertGroupMemberSourceController
    );
    repository = moduleRef.get<GroupMemberSourceRepositoryReadWrite>(
      GroupMemberSourceRepositoryReadWrite
    ) as FakeGroupMemberSourceRepository;
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a group member source', ({
    given,
    when,
    then,
    and,
  }) => {
    let groupMemberSources: GroupMemberSource[];
    let groupMemberSourcesLengthBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertGroupMemberSourceDto: UpsertGroupMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      const memberDto = MemberBuilder().doesntExist().buildDto();
      const groupMemberDto = GroupMemberBuilder()
        .doesntExist()
        .buildGroupMemberResponseDto(memberDto);
      upsertGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildCreateUpsertGroupMemberSourceRequestDto(
          groupMemberDto
        );
    });

    and('no matching record is found at the source', async () => {
      groupMemberSources = await executeTask(repository.all());
      groupMemberSourcesLengthBefore = groupMemberSources.length;
    });

    when('I attempt to upsert a group member source', async () => {
      try {
        result = await controller.upsert(upsertGroupMemberSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a new record should have been created', async () => {
      groupMemberSources = await executeTask(repository.all());
      expect(groupMemberSources.length).toEqual(
        groupMemberSourcesLengthBefore + 1
      );
    });

    and('the created record should be returned', async () => {
      expect(result.memberId).toBeDefined();
    });
  });

  test('Successfully updating a group member source by Member Id', ({
    given,
    when,
    then,
    and,
  }) => {
    let groupMemberSourcesLengthBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertGroupMemberSourceDto: UpsertGroupMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      upsertGroupMemberSourceDto = GroupMemberSourceBuilder()
        .updated()
        .buildUpdateUpsertGroupMemberSourceRequestDto();
    });

    and('a matching record is found at the source', async () => {
      const groupMemberSources = await executeTask(repository.all());
      groupMemberSourcesLengthBefore = groupMemberSources.length;
    });

    when('I attempt to upsert a group member source', async () => {
      try {
        result = await controller.upsert(upsertGroupMemberSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the record should have been updated', async () => {
      const groupMemberSources = await executeTask(repository.all());
      expect(groupMemberSources.length).toEqual(groupMemberSourcesLengthBefore);
    });

    and('the updated record should be returned', async () => {
      expect(result.memberId).toBeDefined();
    });
  });

  test('Successfully updating a group member source by Member email', ({
    given,
    when,
    then,
    and,
  }) => {
    let groupMemberSourcesLengthBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertGroupMemberSourceDto: UpsertGroupMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      upsertGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildUpdateUpsertGroupMemberSourceRequestDto();
      // remove the source Ids so it has to find by email
      upsertGroupMemberSourceDto.groupMember.member.sourceIds = [];
    });

    and('a matching record is found at the source', async () => {
      const groupMemberSources = await executeTask(repository.all());
      groupMemberSourcesLengthBefore = groupMemberSources.length;
    });

    when('I attempt to upsert a group member source', async () => {
      try {
        result = await controller.upsert(upsertGroupMemberSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the record should have been updated', async () => {
      const groupMemberSources = await executeTask(repository.all());
      expect(groupMemberSources.length).toEqual(groupMemberSourcesLengthBefore);
    });

    and('the updated record should be returned', async () => {
      expect(result.memberId).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let upsertGroupMemberSourceDto: UpsertGroupMemberSourceRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      upsertGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildUpdateUpsertGroupMemberSourceRequestDto();
      // remove the source Ids so it has to find by email
      upsertGroupMemberSourceDto.source = 'INVALID';
    });

    when('I attempt to upsert a group member source', async () => {
      try {
        await controller.upsert(upsertGroupMemberSourceDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
