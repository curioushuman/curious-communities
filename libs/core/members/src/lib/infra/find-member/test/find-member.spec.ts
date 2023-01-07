import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { MemberModule } from '../../../test/member.module.fake';
import { FindMemberModule } from '../../../find-member.module';
import {
  FindByEmailMemberRequestDto,
  FindByIdMemberRequestDto,
  FindByIdSourceValueMemberRequestDto,
} from '../dto/find-member.request.dto';
import { MemberBuilder } from '../../../test/builders/member.builder';
import { FindMemberController } from '../../../infra/find-member/find-member.controller';
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

const feature = loadFeature('./find-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: FindMemberController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    FindMemberModule.applyDefaults(app);
    controller = moduleRef.get<FindMemberController>(FindMemberController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully finding a member by Id', ({ given, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findMemberDto: FindByIdMemberRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findMemberDto = MemberBuilder().exists().buildFindByIdMemberRequestDto();
    });

    when('I attempt to find a member', async () => {
      try {
        result = await controller.find(findMemberDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      expect(result.id).toEqual(findMemberDto.id);
    });
  });

  test('Successfully finding a member by Source Id', ({
    given,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findMemberDto: FindByIdSourceValueMemberRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findMemberDto = MemberBuilder()
        .exists()
        .buildFindByIdSourceValueMemberRequestDto();
    });

    when('I attempt to find a member', async () => {
      try {
        result = await controller.find(findMemberDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      expect(result.sourceIds[0]).toEqual(findMemberDto.idSourceValue);
    });
  });

  test('Successfully finding a member by email', ({ given, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findMemberDto: FindByEmailMemberRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findMemberDto = MemberBuilder()
        .exists()
        .buildFindByEmailMemberRequestDto();
    });

    when('I attempt to find a member', async () => {
      try {
        result = await controller.find(findMemberDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      expect(result.email).toEqual(findMemberDto.email);
    });
  });

  test('Fail; Invalid request', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findMemberDto: FindByIdSourceValueMemberRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      findMemberDto = MemberBuilder()
        .invalid()
        .buildFindByIdSourceValueMemberRequestDto();
    });

    when('I attempt to find a member', async () => {
      try {
        result = await controller.find(findMemberDto);
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
