import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateParticipantCommand,
  CreateParticipantHandler,
} from '../create-participant.command';
import { ParticipantRepository } from '../../../../adapter/ports/participant.repository';
import { FakeParticipantRepository } from '../../../../adapter/implementations/fake/fake.participant.repository';
import { ParticipantSourceRepository } from '../../../../adapter/ports/participant-source.repository';
import { FakeParticipantSourceRepository } from '../../../../adapter/implementations/fake/fake.participant-source.repository';
import { Participant } from '../../../../domain/entities/participant';
import { ParticipantBuilder } from '../../../../test/builders/participant.builder';
import { CreateParticipantDto } from '../create-participant.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-participant.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeParticipantRepository;
  let handler: CreateParticipantHandler;
  let createParticipantDto: CreateParticipantDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateParticipantHandler,
        LoggableLogger,
        { provide: ParticipantRepository, useClass: FakeParticipantRepository },
        {
          provide: ParticipantSourceRepository,
          useClass: FakeParticipantSourceRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<ParticipantRepository>(
      ParticipantRepository
    ) as FakeParticipantRepository;
    handler = moduleRef.get<CreateParticipantHandler>(CreateParticipantHandler);
  });

  test('Successfully creating a participant', ({ given, and, when, then }) => {
    let participants: Participant[];
    let participantsBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createParticipantDto = ParticipantBuilder()
        .beta()
        .buildCreateParticipantDto();

      participants = await executeTask(repository.all());
      participantsBefore = participants.length;
    });

    when('I attempt to create a participant', async () => {
      result = await handler.execute(
        new CreateParticipantCommand(createParticipantDto)
      );
    });

    then('a new record should have been created', async () => {
      participants = await executeTask(repository.all());
      expect(participants.length).toEqual(participantsBefore + 1);
    });

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      createParticipantDto = ParticipantBuilder()
        .invalidOther()
        .buildCreateParticipantDto();
    });

    when('I attempt to create a participant', async () => {
      try {
        await handler.execute(
          new CreateParticipantCommand(createParticipantDto)
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
