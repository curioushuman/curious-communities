import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { GroupModule } from '../../../test/group.module.fake';
import { FindGroupModule } from '../../../find-group.module';
import {
  FindBySlugGroupRequestDto,
  FindByIdGroupRequestDto,
  FindByIdSourceValueGroupRequestDto,
} from '../dto/find-group.request.dto';
import { GroupBuilder } from '../../../test/builders/group.builder';
import { FindGroupController } from '../../../infra/find-group/find-group.controller';
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

const feature = loadFeature('./find-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: FindGroupController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    FindGroupModule.applyDefaults(app);
    controller = moduleRef.get<FindGroupController>(FindGroupController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully finding a group by Id', ({ given, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findGroupDto: FindByIdGroupRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupDto = GroupBuilder().exists().buildFindByIdGroupRequestDto();
    });

    when('I attempt to find a group', async () => {
      try {
        result = await controller.find(findGroupDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      expect(result.id).toEqual(findGroupDto.id);
    });
  });

  test('Successfully finding a group by Source Id', ({ given, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findGroupDto: FindByIdSourceValueGroupRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupDto = GroupBuilder()
        .exists()
        .buildFindByIdSourceValueGroupRequestDto();
    });

    when('I attempt to find a group', async () => {
      try {
        result = await controller.find(findGroupDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      expect(result.sourceIds[0]).toEqual(findGroupDto.idSourceValue);
    });
  });

  test('Successfully finding a group by slug', ({ given, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findGroupDto: FindBySlugGroupRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupDto = GroupBuilder().exists().buildFindBySlugGroupRequestDto();
    });

    when('I attempt to find a group', async () => {
      try {
        result = await controller.find(findGroupDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      expect(result.slug).toEqual(findGroupDto.slug);
    });
  });

  test('Fail; Invalid request', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findGroupDto: FindByIdSourceValueGroupRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      findGroupDto = GroupBuilder()
        .invalid()
        .buildFindByIdSourceValueGroupRequestDto();
    });

    when('I attempt to find a group', async () => {
      try {
        result = await controller.find(findGroupDto);
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
