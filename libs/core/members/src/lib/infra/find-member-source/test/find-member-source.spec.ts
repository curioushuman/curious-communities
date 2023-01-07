import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { MemberModule } from '../../../test/member.module.fake';
import { FindMemberSourceModule } from '../../../find-member-source.module';
import { FindMemberSourceRequestDto } from '../dto/find-member-source.request.dto';
import { MemberSourceBuilder } from '../../../test/builders/member-source.builder';
import { FindMemberSourceController } from '../../../infra/find-member-source/find-member-source.controller';
import { RequestInvalidError } from '@curioushuman/error-factory';
import { prepareExternalIdSourceValue } from '@curioushuman/common';
import config from '../../../static/config';

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

const feature = loadFeature('./find-member-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: FindMemberSourceController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    FindMemberSourceModule.applyDefaults(app);
    controller = moduleRef.get<FindMemberSourceController>(
      FindMemberSourceController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully finding a member source by Source Id', ({
    given,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findMemberSourceDto: FindMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findMemberSourceDto = MemberSourceBuilder()
        .exists()
        .buildFindByIdSourceValueMemberRequestDto();
    });

    when('I attempt to find a member source', async () => {
      try {
        result = await controller.find(findMemberSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      const idSourceValue = prepareExternalIdSourceValue(
        result.id,
        config.defaults.primaryAccountSource
      );
      expect(idSourceValue).toEqual(findMemberSourceDto.idSourceValue);
    });
  });

  test('Successfully finding a member source by email', ({
    given,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findMemberSourceDto: FindMemberSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findMemberSourceDto = MemberSourceBuilder()
        .exists()
        .buildFindByEmailMemberRequestDto();
    });

    when('I attempt to find a member source', async () => {
      try {
        result = await controller.find(findMemberSourceDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      expect(result.email).toEqual(findMemberSourceDto.email);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let findMemberSourceDto: FindMemberSourceRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      findMemberSourceDto = MemberSourceBuilder()
        .invalid()
        .buildFindByIdSourceValueMemberRequestDto();
    });

    when('I attempt to find a member source', async () => {
      try {
        await controller.find(findMemberSourceDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
