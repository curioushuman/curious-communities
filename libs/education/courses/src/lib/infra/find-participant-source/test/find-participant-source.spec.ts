import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { ParticipantModule } from '../../../test/participant.module.fake';
import { FindParticipantSourceRequestDto } from '../dto/find-participant-source.request.dto';
import { ParticipantSourceBuilder } from '../../../test/builders/participant-source.builder';
import { FindParticipantSourceController } from '../../../infra/find-participant-source/find-participant-source.controller';
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

const feature = loadFeature('./find-participant-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: FindParticipantSourceController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ParticipantModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    ParticipantModule.applyDefaults(app);
    controller = moduleRef.get<FindParticipantSourceController>(
      FindParticipantSourceController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully finding a participant source by Source Id', ({
    given,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findParticipantSourceDto: FindParticipantSourceRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findParticipantSourceDto = ParticipantSourceBuilder()
        .exists()
        .buildFindParticipantSourceRequestDto();
    });

    when('I attempt to find a participant source', async () => {
      try {
        result = await controller.find(findParticipantSourceDto);
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
      expect(idSourceValue).toEqual(findParticipantSourceDto.idSourceValue);
    });
  });

  test('Fail; Invalid request', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findParticipantSourceDto: FindParticipantSourceRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      findParticipantSourceDto = ParticipantSourceBuilder()
        .invalid()
        .buildFindParticipantSourceRequestDto();
    });

    when('I attempt to find a participant source', async () => {
      try {
        result = await controller.find(findParticipantSourceDto);
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
