import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { ParticipantModule } from '../../../test/participant.module.fake';
import { FindParticipantModule } from '../../../find-participant.module';
import {
  FindByIdParticipantRequestDto,
  FindByIdSourceValueParticipantRequestDto,
} from '../dto/find-participant.request.dto';
import { ParticipantBuilder } from '../../../test/builders/participant.builder';
import { FindParticipantController } from '../../../infra/find-participant/find-participant.controller';
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

const feature = loadFeature('./find-participant.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: FindParticipantController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ParticipantModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    FindParticipantModule.applyDefaults(app);
    controller = moduleRef.get<FindParticipantController>(
      FindParticipantController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully finding a participant by Id', ({ given, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findParticipantDto: FindByIdParticipantRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findParticipantDto = ParticipantBuilder()
        .exists()
        .buildFindByIdParticipantRequestDto();
    });

    when('I attempt to find a participant', async () => {
      try {
        result = await controller.findById(findParticipantDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      expect(result.id).toEqual(findParticipantDto.id);
    });
  });

  test('Successfully finding a participant by Source Id', ({
    given,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findParticipantDto: FindByIdSourceValueParticipantRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findParticipantDto = ParticipantBuilder()
        .exists()
        .buildFindByIdSourceValueParticipantRequestDto();
    });

    when('I attempt to find a participant', async () => {
      try {
        result = await controller.findByIdSourceValue(findParticipantDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('a record should have been returned', async () => {
      expect(result.sourceIds[0]).toEqual(findParticipantDto.idSourceValue);
    });
  });

  test('Fail; Invalid request', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let findParticipantDto: FindByIdSourceValueParticipantRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      findParticipantDto = ParticipantBuilder()
        .invalid()
        .buildFindByIdSourceValueParticipantRequestDto();
    });

    when('I attempt to find a participant', async () => {
      try {
        result = await controller.find(findParticipantDto);
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
