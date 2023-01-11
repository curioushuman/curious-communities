import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { GroupModule } from '../../../test/group.module.fake';
import { UpsertGroupSourceModule } from '../../../upsert-group-source.module';
import { GroupSourceBuilder } from '../../../test/builders/group-source.builder';
import { UpsertGroupSourceController } from '../../../infra/upsert-group-source/upsert-group-source.controller';
import { UpsertGroupSourceRequestDto } from '../dto/upsert-group-source.request.dto';
import { FakeGroupSourceCommunityRepository } from '../../../adapter/implementations/fake/fake.group-source.community.repository';
import { GroupSourceCommunityRepository } from '../../../adapter/ports/group-source.repository';
import { GroupSource } from '../../../domain/entities/group-source';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { RequestInvalidError } from '@curioushuman/error-factory';

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

const matchingRecordFound = async (
  repository: FakeGroupSourceCommunityRepository,
  dto: UpsertGroupSourceRequestDto
): Promise<GroupSource | undefined> => {
  const groupSources = await executeTask(repository.all());
  const groupSource = groupSources.find(
    (groupSource) => groupSource.name === dto.group.name
  );
  expect(groupSource).toBeDefined();
  return groupSource;
};

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: UpsertGroupSourceController;
  let repository: FakeGroupSourceCommunityRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    UpsertGroupSourceModule.applyDefaults(app);
    controller = moduleRef.get<UpsertGroupSourceController>(
      UpsertGroupSourceController
    );
    repository = moduleRef.get<GroupSourceCommunityRepository>(
      GroupSourceCommunityRepository
    ) as FakeGroupSourceCommunityRepository;
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
      await matchingRecordFound(repository, upsertGroupSourceDto);
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
      const groupSourceAfter = await matchingRecordFound(
        repository,
        upsertGroupSourceDto
      );
      if (groupSourceAfter) {
        expect(groupSourceAfter.status).toEqual(
          upsertGroupSourceDto.group.status
        );
      }
    });

    and('the updated record should be returned', async () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully updating a group source by entity', ({
    given,
    when,
    then,
    and,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertGroupSourceDto: UpsertGroupSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      upsertGroupSourceDto =
        GroupSourceBuilder().buildUpdateByEntityUpsertGroupSourceRequestDto();
    });

    and('a matching record is found at the source', async () => {
      await matchingRecordFound(repository, upsertGroupSourceDto);
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
      const groupSourceAfter = await matchingRecordFound(
        repository,
        upsertGroupSourceDto
      );
      if (groupSourceAfter) {
        expect(groupSourceAfter.status).toEqual(
          upsertGroupSourceDto.group.status
        );
      }
    });

    and('the updated record should be returned', async () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let upsertGroupSourceDto: UpsertGroupSourceRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      upsertGroupSourceDto = GroupSourceBuilder()
        .invalid()
        .buildInvalidUpsertGroupSourceRequestDto();
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
