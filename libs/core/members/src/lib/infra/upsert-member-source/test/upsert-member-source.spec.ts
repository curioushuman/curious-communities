import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { MemberModule } from '../../../test/member.module.fake';
import { MemberSourceBuilder } from '../../../test/builders/member-source.builder';
import { UpsertMemberSourceController } from '../../../infra/upsert-member-source/upsert-member-source.controller';
import { UpsertMemberSourceRequestDto } from '../dto/upsert-member-source.request.dto';
import { FakeMemberSourceRepository } from '../../../adapter/implementations/fake/fake.member-source.repository';
import { MemberSourceRepositoryReadWrite } from '../../../adapter/ports/member-source.repository';
import { MemberSource } from '../../../domain/entities/member-source';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { prepareMemberExternalIdSource } from '../../../domain/entities/member';
import { MemberEmail } from '../../../domain/value-objects/member-email';
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

const feature = loadFeature('./upsert-member-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: UpsertMemberSourceController;
  let repository: FakeMemberSourceRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    MemberModule.applyDefaults(app);
    controller = moduleRef.get<UpsertMemberSourceController>(
      UpsertMemberSourceController
    );
    repository = moduleRef.get<MemberSourceRepositoryReadWrite>(
      MemberSourceRepositoryReadWrite
    ) as FakeMemberSourceRepository;
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a member source', ({
    given,
    when,
    then,
    and,
  }) => {
    let memberSources: MemberSource[];
    let memberSourcesBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertMemberSourceDto: UpsertMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      upsertMemberSourceDto =
        MemberSourceBuilder().buildCreateUpsertMemberSourceRequestDto();
    });

    and('no matching record is found at the source', async () => {
      memberSources = await executeTask(repository.all());
      memberSourcesBefore = memberSources.length;
    });

    when('I attempt to upsert a member source', async () => {
      try {
        result = await controller.upsert(upsertMemberSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a new record should have been created', async () => {
      memberSources = await executeTask(repository.all());
      expect(memberSources.length).toEqual(memberSourcesBefore + 1);
    });

    and('the created record should be returned', async () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully updating a member source by Source Id', ({
    given,
    when,
    then,
    and,
  }) => {
    let memberSourceBefore: MemberSource;
    let memberSourceId: MemberSourceId;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertMemberSourceDto: UpsertMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      upsertMemberSourceDto =
        MemberSourceBuilder().buildUpdateUpsertMemberSourceRequestDto();
    });

    and('a matching record is found at the source', async () => {
      // we'll grab the memberSource before the update
      const idSourceValue = upsertMemberSourceDto.member.sourceIds[0];
      const idSource = prepareMemberExternalIdSource(idSourceValue);
      memberSourceId = idSource.id as MemberSourceId;
      const memberSources = await executeTask(repository.all());
      memberSourceBefore = memberSources.find(
        (memberSource) => memberSource.id === memberSourceId
      ) as MemberSource;
      expect(memberSourceBefore).toBeDefined();
    });

    when('I attempt to upsert a member source', async () => {
      try {
        result = await controller.upsert(upsertMemberSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the record should have been updated', async () => {
      const memberSources = await executeTask(repository.all());
      const memberSourceAfter = memberSources.find(
        (memberSource) => memberSource.id === memberSourceId
      );
      expect(memberSourceAfter).toBeDefined();
      if (memberSourceAfter) {
        expect(memberSourceAfter.status).toEqual(
          upsertMemberSourceDto.member.status
        );
      }
    });

    and('the updated record should be returned', async () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully updating a member source by email', ({
    given,
    when,
    then,
    and,
  }) => {
    let memberSourceBefore: MemberSource;
    let memberEmail: MemberSourceId;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let upsertMemberSourceDto: UpsertMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      upsertMemberSourceDto = MemberSourceBuilder()
        .exists()
        .buildUpdateByEmailUpsertMemberSourceRequestDto();
    });

    and('a matching record is found at the source', async () => {
      // we'll grab the memberSource before the update
      memberEmail = MemberEmail.check(upsertMemberSourceDto.member.email);
      const memberSources = await executeTask(repository.all());
      memberSourceBefore = memberSources.find(
        (memberSource) => memberSource.email === memberEmail
      ) as MemberSource;
      expect(memberSourceBefore).toBeDefined();
    });

    when('I attempt to upsert a member source', async () => {
      try {
        result = await controller.upsert(upsertMemberSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the record should have been updated', async () => {
      const memberSources = await executeTask(repository.all());
      const memberSourceAfter = memberSources.find(
        (memberSource) => memberSource.email === memberEmail
      );
      expect(memberSourceAfter).toBeDefined();
      if (memberSourceAfter) {
        expect(memberSourceAfter.status).toEqual(
          upsertMemberSourceDto.member.status
        );
      }
    });

    and('the updated record should be returned', async () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let upsertMemberSourceDto: UpsertMemberSourceRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      upsertMemberSourceDto = MemberSourceBuilder()
        .invalid()
        .buildInvalidUpsertMemberSourceRequestDto();
    });

    when('I attempt to upsert a member source', async () => {
      try {
        await controller.upsert(upsertMemberSourceDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
