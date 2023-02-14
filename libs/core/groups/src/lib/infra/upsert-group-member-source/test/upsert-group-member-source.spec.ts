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
import { GroupMemberSourceId } from '../../../domain/value-objects/group-member-source-id';
import { prepareGroupMemberExternalIdSource } from '../../../domain/entities/group-member';
import { GroupMemberEmail } from '../../../domain/value-objects/group-member-email';
import { GroupMemberBuilder } from '../../../test/builders/group-member.builder';

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

  test('Successfully creating a group source', ({ given, when, then, and }) => {
    let groupSources: GroupMemberSource[];
    let groupSourcesBefore: number;
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
      groupSources = await executeTask(repository.all());
      groupSourcesBefore = groupSources.length;
    });

    when('I attempt to upsert a group source', async () => {
      try {
        result = await controller.upsert(upsertGroupMemberSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a new record should have been created', async () => {
      groupSources = await executeTask(repository.all());
      expect(groupSources.length).toEqual(groupSourcesBefore + 1);
    });

    and('the created record should be returned', async () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully updating a group source by Source Id', ({
    given,
    when,
    then,
    and,
  }) => {
    let groupSourceBefore: GroupMemberSource;
    let groupSourceId: GroupMemberSourceId;
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
      // we'll grab the groupSource before the update
      const idSourceValue = upsertGroupMemberSourceDto.groupMember.sourceIds[0];
      const idSource = prepareGroupMemberExternalIdSource(idSourceValue);
      groupSourceId = idSource.id as GroupMemberSourceId;
      const groupSources = await executeTask(repository.all());
      groupSourceBefore = groupSources.find(
        (groupSource) => groupSource.id === groupSourceId
      ) as GroupMemberSource;
      expect(groupSourceBefore).toBeDefined();
    });

    when('I attempt to upsert a group source', async () => {
      try {
        result = await controller.upsert(upsertGroupMemberSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the record should have been updated', async () => {
      const groupSources = await executeTask(repository.all());
      const groupSourceAfter = groupSources.find(
        (groupSource) => groupSource.id === groupSourceId
      );
      expect(groupSourceAfter).toBeDefined();
      if (groupSourceAfter) {
        expect(groupSourceAfter.status).toEqual(
          upsertGroupMemberSourceDto.groupMember.status
        );
      }
    });

    and('the updated record should be returned', async () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully updating a group source by email', ({
    given,
    when,
    then,
    and,
  }) => {
    let groupSourceBefore: GroupMemberSource;
    let groupEmail: GroupMemberSourceId;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertGroupMemberSourceDto: UpsertGroupMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // this creates a group with no idSources, so we defer to email
      const groupMember = GroupMemberBuilder()
        .noSourceExists()
        .buildGroupMemberResponseDto();
      // this is what updatedAlpha would look like
      const groupMemberSource = GroupMemberSourceBuilder()
        .updatedAlpha()
        .build();
      // now we'll set some values from the groupMemberSource to the groupMember
      // so that it can be found by email, and updated
      groupMember.email = groupMemberSource.email;
      groupMember.status = groupMemberSource.status;
      upsertGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildUpdateUpsertGroupMemberSourceRequestDto(
          groupMember
        );
    });

    and('a matching record is found at the source', async () => {
      // we'll grab the groupSource before the update
      groupEmail = GroupMemberEmail.check(
        upsertGroupMemberSourceDto.groupMember.email
      );
      const groupSources = await executeTask(repository.all());
      groupSourceBefore = groupSources.find(
        (groupSource) => groupSource.email === groupEmail
      ) as GroupMemberSource;
      expect(groupSourceBefore).toBeDefined();
    });

    when('I attempt to upsert a group source', async () => {
      try {
        result = await controller.upsert(upsertGroupMemberSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the record should have been updated', async () => {
      const groupSources = await executeTask(repository.all());
      const groupSourceAfter = groupSources.find(
        (groupSource) => groupSource.email === groupEmail
      );
      expect(groupSourceAfter).toBeDefined();
      if (groupSourceAfter) {
        expect(groupSourceAfter.status).toEqual(
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
      const groupMember = GroupMemberBuilder()
        .invalid()
        .buildGroupMemberResponseDto();
      upsertGroupMemberSourceDto = GroupMemberSourceBuilder()
        .invalid()
        .buildCreateUpsertGroupMemberSourceRequestDto(groupMember);
    });

    when('I attempt to upsert a group source', async () => {
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
