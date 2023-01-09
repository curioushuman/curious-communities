import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { GroupModule } from '../../../test/group.module.fake';
import { FindGroupSourceModule } from '../../../find-group-source.module';
import { FindGroupSourceRequestDto } from '../dto/find-group-source.request.dto';
import { GroupSourceBuilder } from '../../../test/builders/group-source.builder';
import { FindGroupSourceController } from '../../../infra/find-group-source/find-group-source.controller';
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

const feature = loadFeature('./find-group-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: FindGroupSourceController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    FindGroupSourceModule.applyDefaults(app);
    controller = moduleRef.get<FindGroupSourceController>(
      FindGroupSourceController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully finding a group source by Source Id', ({
    given,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findGroupSourceDto: FindGroupSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupSourceDto = GroupSourceBuilder()
        .exists()
        .buildFindByIdSourceValueGroupSourceRequestDto();
    });

    when('I attempt to find a group source', async () => {
      try {
        result = await controller.find(findGroupSourceDto);
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
      expect(idSourceValue).toEqual(findGroupSourceDto.idSourceValue);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let findGroupSourceDto: FindGroupSourceRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      findGroupSourceDto = GroupSourceBuilder()
        .invalid()
        .buildFindByIdSourceValueGroupSourceRequestDto();
    });

    when('I attempt to find a group source', async () => {
      try {
        await controller.find(findGroupSourceDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
