import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { GroupModule } from '../../../test/group.module.fake';
import { GroupSourceBuilder } from '../../../test/builders/group-source.builder';
import { UpsertGroupSourceController } from '../../../infra/upsert-group-source/upsert-group-source.controller';
import { UpsertGroupSourceRequestDto } from '../dto/upsert-group-source.request.dto';
import { FakeGroupSourceRepository } from '../../../adapter/implementations/fake/fake.group-source.repository';
import { GroupSourceRepositoryReadWrite } from '../../../adapter/ports/group-source.repository';
import { GroupSource } from '../../../domain/entities/group-source';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { prepareGroupExternalIdSource } from '../../../domain/entities/group';
import { GroupName } from '../../../domain/value-objects/group-name';
import { RequestInvalidError } from '@curioushuman/error-factory';
import { GroupBuilder } from '../../../test/builders/group.builder';

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

const feature = loadFeature('./upsert-group-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: UpsertGroupSourceController;
  let repository: FakeGroupSourceRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    GroupModule.applyDefaults(app);
    controller = moduleRef.get<UpsertGroupSourceController>(
      UpsertGroupSourceController
    );
    repository = moduleRef.get<GroupSourceRepositoryReadWrite>(
      GroupSourceRepositoryReadWrite
    ) as FakeGroupSourceRepository;
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a group source', ({ given, when, then, and }) => {
    let groupSources: GroupSource[];
    let groupSourcesBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertGroupSourceDto: UpsertGroupSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      upsertGroupSourceDto =
        GroupSourceBuilder().buildCreateUpsertGroupSourceRequestDto();
    });

    and('no matching record is found at the source', async () => {
      groupSources = await executeTask(repository.all());
      groupSourcesBefore = groupSources.length;
    });

    when('I attempt to upsert a group source', async () => {
      try {
        result = await controller.upsert(upsertGroupSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a new record should have been created', async () => {
      groupSources = await executeTask(repository.all());
      expect(groupSources.length).toEqual(groupSourcesBefore + 1);
    });

    and('the created record should be returned within payload', async () => {
      expect(result.detail.id).toBeDefined();
      expect(result.event).toEqual('created');
      expect(result.outcome).toEqual('success');
    });
  });

  test('Successfully updating a group source by Source Id', ({
    given,
    when,
    then,
    and,
  }) => {
    let groupSourceBefore: GroupSource;
    let groupSourceId: GroupSourceId;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertGroupSourceDto: UpsertGroupSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      upsertGroupSourceDto =
        GroupSourceBuilder().buildUpdateUpsertGroupSourceRequestDto();
    });

    and('a matching record is found at the source', async () => {
      // we'll grab the groupSource before the update
      const idSourceValue = upsertGroupSourceDto.group.sourceIds[0];
      const idSource = prepareGroupExternalIdSource(idSourceValue);
      groupSourceId = idSource.id as GroupSourceId;
      const groupSources = await executeTask(repository.all());
      groupSourceBefore = groupSources.find(
        (groupSource) => groupSource.id === groupSourceId
      ) as GroupSource;
      expect(groupSourceBefore).toBeDefined();
    });

    when('I attempt to upsert a group source', async () => {
      try {
        result = await controller.upsert(upsertGroupSourceDto);
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
          upsertGroupSourceDto.group.status
        );
      }
    });

    and('the updated record should be returned within payload', async () => {
      expect(result.detail.id).toBeDefined();
      expect(result.event).toEqual('updated');
      expect(result.outcome).toEqual('success');
    });
  });

  test('Successfully updating a group source by name', ({
    given,
    when,
    then,
    and,
  }) => {
    let groupSourceBefore: GroupSource;
    let groupName: GroupName;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertGroupSourceDto: UpsertGroupSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // this creates a group with no idSources, so we defer to name
      const group = GroupBuilder().noSourceExists().buildGroupBaseResponseDto();
      // this is what updatedAlpha would look like
      const groupSource = GroupSourceBuilder().updatedAlpha().build();
      // now we'll set some values from the groupSource to the group
      // so that it can be found by name, and updated
      group.name = groupSource.name;
      group.status = groupSource.status;
      upsertGroupSourceDto =
        GroupSourceBuilder().buildUpdateUpsertGroupSourceRequestDto(group);
    });

    and('a matching record is found at the source', async () => {
      // we'll grab the groupSource before the update
      groupName = GroupName.check(upsertGroupSourceDto.group.name);
      const groupSources = await executeTask(repository.all());
      groupSourceBefore = groupSources.find(
        (groupSource) => groupSource.name === groupName
      ) as GroupSource;
      expect(groupSourceBefore).toBeDefined();
    });

    when('I attempt to upsert a group source', async () => {
      try {
        result = await controller.upsert(upsertGroupSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the record should have been updated', async () => {
      const groupSources = await executeTask(repository.all());
      const groupSourceAfter = groupSources.find(
        (groupSource) => groupSource.name === groupName
      );
      expect(groupSourceAfter).toBeDefined();
      if (groupSourceAfter) {
        expect(groupSourceAfter.status).toEqual(
          upsertGroupSourceDto.group.status
        );
      }
    });

    and('the updated record should be returned within payload', async () => {
      expect(result.detail.id).toBeDefined();
      expect(result.event).toEqual('updated');
      expect(result.outcome).toEqual('success');
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let upsertGroupSourceDto: UpsertGroupSourceRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      const group = GroupBuilder().invalid().buildGroupBaseResponseDto();
      upsertGroupSourceDto = GroupSourceBuilder()
        .invalid()
        .buildCreateUpsertGroupSourceRequestDto(group);
    });

    when('I attempt to upsert a group source', async () => {
      try {
        await controller.upsert(upsertGroupSourceDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
