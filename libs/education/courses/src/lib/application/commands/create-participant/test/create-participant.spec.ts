import { NotFoundException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RepositoryItemConflictError,
  SourceInvalidError,
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
 * - request validation
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

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      createParticipantDto = ParticipantBuilder()
        .beta()
        .buildCreateParticipantDto();
    });

    and('the returned source populates a valid participant', () => {
      // we know this to be true
      // out of scope for this test
    });

    and('the source does not already exist in our DB', async () => {
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

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let error: Error;

    given('no record exists that matches our request', () => {
      createParticipantDto = ParticipantBuilder()
        .noMatchingSource()
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

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Source does not translate into a valid Participant', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      createParticipantDto = ParticipantBuilder()
        .invalidSource()
        .buildCreateParticipantDto();
    });

    and('the returned source does not populate a valid Participant', () => {
      // this occurs during
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

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });

  test('Fail; Source already exists in our DB', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      // confirmed
    });

    and('the returned source populates a valid participant', () => {
      // known
    });

    and('the source DOES already exist in our DB', () => {
      createParticipantDto = ParticipantBuilder()
        .exists()
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

    then('I should receive an RepositoryItemConflictError', () => {
      expect(error).toBeInstanceOf(RepositoryItemConflictError);
    });
  });

  test('Fail; Source is an invalid status to be created in admin', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      // we know this
    });

    and('the returned source has an invalid status', () => {
      createParticipantDto = ParticipantBuilder()
        .invalidStatus()
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

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
