import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { executeTask } from '@curioushuman/fp-ts-utils';
import { RequestInvalidError } from '@curioushuman/error-factory';

import { GroupMemberModule } from '../../../test/group-member.module.fake';
import { UpsertGroupMemberSourceModule } from '../../../upsert-group-member-source.module';
import { GroupMemberSourceBuilder } from '../../../test/builders/group-member-source.builder';
import { UpsertGroupMemberSourceController } from '../../../infra/upsert-group-member-source/upsert-group-member-source.controller';
import { UpsertGroupMemberSourceRequestDto } from '../dto/upsert-group-member-source.request.dto';
import { FakeGroupMemberSourceCommunityRepository } from '../../../adapter/implementations/fake/fake.group-member-source.community.repository';
import { GroupMemberSourceCommunityRepository } from '../../../adapter/ports/group-member-source.repository';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';

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

const matchingRecordFound = async (
  repository: FakeGroupMemberSourceCommunityRepository,
  dto: UpsertGroupMemberSourceRequestDto
): Promise<GroupMemberSource | undefined> => {
  const groupMemberSources = await executeTask(repository.all());
  const groupMemberSource = groupMemberSources.find(
    (groupMemberSource) => groupMemberSource.email === dto.groupMember.email
  );
  expect(groupMemberSource).toBeDefined();
  return groupMemberSource;
};

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: UpsertGroupMemberSourceController;
  let repository: FakeGroupMemberSourceCommunityRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupMemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    UpsertGroupMemberSourceModule.applyDefaults(app);
    controller = moduleRef.get<UpsertGroupMemberSourceController>(
      UpsertGroupMemberSourceController
    );
    repository = moduleRef.get<GroupMemberSourceCommunityRepository>(
      GroupMemberSourceCommunityRepository
    ) as FakeGroupMemberSourceCommunityRepository;
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
    let groupMemberSourcesBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertGroupMemberSourceDto: UpsertGroupMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      upsertGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildCreateUpsertGroupMemberSourceRequestDto();
    });

    and('no matching record is found at the source', async () => {
      groupMemberSources = await executeTask(repository.all());
      groupMemberSourcesBefore = groupMemberSources.length;
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
      expect(groupMemberSources.length).toEqual(groupMemberSourcesBefore + 1);
    });

    and('the created record should be returned', async () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully updating a group member source by Source Id', ({
    given,
    when,
    then,
    and,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertGroupMemberSourceDto: UpsertGroupMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      upsertGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildUpdateUpsertGroupMemberSourceRequestDto();
    });

    and('a matching record is found at the source', async () => {
      const groupMemberSourceBefore = await matchingRecordFound(
        repository,
        upsertGroupMemberSourceDto
      );
      if (groupMemberSourceBefore) {
        expect(groupMemberSourceBefore.status).not.toEqual(
          upsertGroupMemberSourceDto.groupMember.status
        );
      }
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
      const groupMemberSourceAfter = await matchingRecordFound(
        repository,
        upsertGroupMemberSourceDto
      );
      if (groupMemberSourceAfter) {
        expect(groupMemberSourceAfter.status).toEqual(
          upsertGroupMemberSourceDto.groupMember.status
        );
      }
    });

    and('the updated record should be returned', async () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully updating a group member source by entity', ({
    given,
    when,
    then,
    and,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertGroupMemberSourceDto: UpsertGroupMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      upsertGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildUpdateByEntityUpsertGroupMemberSourceRequestDto();
    });

    and('a matching record is found at the source', async () => {
      const groupMemberSourceBefore = await matchingRecordFound(
        repository,
        upsertGroupMemberSourceDto
      );
      if (groupMemberSourceBefore) {
        expect(groupMemberSourceBefore.status).not.toEqual(
          upsertGroupMemberSourceDto.groupMember.status
        );
      }
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
      const groupMemberSourceAfter = await matchingRecordFound(
        repository,
        upsertGroupMemberSourceDto
      );
      if (groupMemberSourceAfter) {
        expect(groupMemberSourceAfter.status).toEqual(
          upsertGroupMemberSourceDto.groupMember.status
        );
      }
    });

    and('the updated record should be returned', async () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let upsertGroupMemberSourceDto: UpsertGroupMemberSourceRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      upsertGroupMemberSourceDto = GroupMemberSourceBuilder()
        .invalid()
        .buildInvalidUpsertGroupMemberSourceRequestDto();
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
