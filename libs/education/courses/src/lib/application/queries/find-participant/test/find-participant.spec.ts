import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  RepositoryItemNotFoundError,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  FindParticipantQuery,
  FindParticipantHandler,
} from '../find-participant.query';
import { ParticipantRepository } from '../../../../adapter/ports/participant.repository';
import { FakeParticipantRepository } from '../../../../adapter/implementations/fake/fake.participant.repository';
import { ParticipantBuilder } from '../../../../test/builders/participant.builder';
import { FindParticipantDto } from '../find-participant.dto';
import { ParticipantSourceRepositoryErrorFactory } from '../../../../adapter/ports/participant-source.repository.error-factory';
import { ParticipantRepositoryErrorFactory } from '../../../../adapter/ports/participant.repository.error-factory';

/**
 * UNIT TEST
 * SUT = the query & query handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-participant.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindParticipantHandler;
  let findParticipantDto: FindParticipantDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindParticipantHandler,
        LoggableLogger,
        { provide: ParticipantRepository, useClass: FakeParticipantRepository },
        {
          provide: ParticipantSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
        {
          provide: ParticipantRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindParticipantHandler>(FindParticipantHandler);
  });

  test('Successfully finding a participant by Id', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findParticipantDto = ParticipantBuilder()
        .exists()
        .buildFindByIdParticipantDto();
    });

    when('I attempt to find a participant', async () => {
      result = await handler.execute(
        new FindParticipantQuery(findParticipantDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a participant by Source Id', ({
    given,
    and,
    when,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findParticipantDto = ParticipantBuilder()
        .exists()
        .buildFindByIdSourceValueParticipantDto();
    });

    when('I attempt to find a participant', async () => {
      result = await handler.execute(
        new FindParticipantQuery(findParticipantDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; participant not found', ({ given, and, when, then }) => {
    let error: Error;

    given('the request is valid', () => {
      findParticipantDto = ParticipantBuilder()
        .doesntExist()
        .buildFindByIdSourceValueParticipantDto();
    });

    and('the participant does NOT exist in the DB', () => {
      // above
    });

    when('I attempt to find a participant', async () => {
      try {
        await handler.execute(new FindParticipantQuery(findParticipantDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      findParticipantDto = ParticipantBuilder()
        .invalid()
        .buildFindByIdSourceValueParticipantDto();
    });

    when('I attempt to find a participant', async () => {
      try {
        await handler.execute(new FindParticipantQuery(findParticipantDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
