import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  RepositoryItemNotFoundError,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  FindParticipantSourceQuery,
  FindParticipantSourceHandler,
} from '../find-participant-source.query';
import { ParticipantSourceRepository } from '../../../../adapter/ports/participant-source.repository';
import { FakeParticipantSourceRepository } from '../../../../adapter/implementations/fake/fake.participant-source.repository';
import { ParticipantSourceBuilder } from '../../../../test/builders/participant-source.builder';
import { FindParticipantSourceDto } from '../find-participant-source.dto';
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

const feature = loadFeature('./find-participant-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindParticipantSourceHandler;
  let findParticipantSourceDto: FindParticipantSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindParticipantSourceHandler,
        LoggableLogger,
        {
          provide: ParticipantSourceRepository,
          useClass: FakeParticipantSourceRepository,
        },
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

    handler = moduleRef.get<FindParticipantSourceHandler>(
      FindParticipantSourceHandler
    );
  });

  test('Successfully finding a participant source by Source Id', ({
    given,
    and,
    when,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findParticipantSourceDto = ParticipantSourceBuilder()
        .exists()
        .buildFindParticipantSourceDto();
    });

    when('I attempt to find a participant source', async () => {
      result = await handler.execute(
        new FindParticipantSourceQuery(findParticipantSourceDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; participant source not found', ({ given, and, when, then }) => {
    let error: Error;

    given('the request is valid', () => {
      findParticipantSourceDto = ParticipantSourceBuilder()
        .doesntExist()
        .buildFindParticipantSourceDto();
    });

    and('the participant source does NOT exist in the DB', () => {
      // above
    });

    when('I attempt to find a participant source', async () => {
      try {
        await handler.execute(
          new FindParticipantSourceQuery(findParticipantSourceDto)
        );
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
      findParticipantSourceDto = ParticipantSourceBuilder()
        .invalid()
        .buildFindParticipantSourceDto();
    });

    when('I attempt to find a participant source', async () => {
      try {
        await handler.execute(
          new FindParticipantSourceQuery(findParticipantSourceDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
