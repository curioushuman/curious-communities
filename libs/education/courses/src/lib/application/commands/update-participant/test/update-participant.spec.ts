import { NotFoundException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  SourceInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  UpdateParticipantCommand,
  UpdateParticipantHandler,
} from '../update-participant.command';
import { ParticipantRepository } from '../../../../adapter/ports/participant.repository';
import { FakeParticipantRepository } from '../../../../adapter/implementations/fake/fake.participant.repository';
import { ParticipantSourceRepository } from '../../../../adapter/ports/participant-source.repository';
import { FakeParticipantSourceRepository } from '../../../../adapter/implementations/fake/fake.participant-source.repository';
import { ParticipantBuilder } from '../../../../test/builders/participant.builder';
import { UpdateParticipantDto } from '../update-participant.dto';
import { ParticipantSource } from '../../../../domain/entities/participant-source';
import { ParticipantSourceBuilder } from '../../../../test/builders/participant-source.builder';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-participant.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeParticipantRepository;
  let participantSourcerepository: FakeParticipantSourceRepository;
  let handler: UpdateParticipantHandler;
  let updateParticipantDto: UpdateParticipantDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateParticipantHandler,
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
    participantSourcerepository = moduleRef.get<ParticipantSourceRepository>(
      ParticipantSourceRepository
    ) as FakeParticipantSourceRepository;
    handler = moduleRef.get<UpdateParticipantHandler>(UpdateParticipantHandler);
  });

  test('Successfully updating a participant', ({ given, and, when, then }) => {
    let updatedParticipantSource: ParticipantSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      updateParticipantDto = ParticipantBuilder()
        .exists()
        .buildUpdateParticipantDto();
    });

    and('the returned source populates a valid participant', async () => {
      // this is an updated version of the `exists()` participantSource
      updatedParticipantSource = ParticipantSourceBuilder().updated().build();
      // save it to our fake repo, we know it is valid
      executeTask(participantSourcerepository.save(updatedParticipantSource));
    });

    and('the source does exist in our DB', async () => {
      const participants = await executeTask(repository.all());
      const participantBefore = participants.find(
        (participant) => participant.id === updateParticipantDto.id
      );
      expect(participantBefore).toBeDefined();
      if (participantBefore) {
        expect(participantBefore.memberName).not.toEqual(
          updatedParticipantSource.memberName
        );
      }
    });

    when('I attempt to update a participant', async () => {
      result = await handler.execute(
        new UpdateParticipantCommand(updateParticipantDto)
      );
    });

    then(
      'the related record should have been updated in the repository',
      async () => {
        const participants = await executeTask(repository.all());
        const participantAfter = participants.find(
          (participant) => participant.id === updateParticipantDto.id
        );
        expect(participantAfter).toBeDefined();
        if (participantAfter) {
          expect(participantAfter.memberName).toEqual(
            updatedParticipantSource.memberName
          );
        }
      }
    );

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let error: Error;

    given('no record exists that matches our request', () => {
      updateParticipantDto = ParticipantBuilder()
        .noMatchingSource()
        .buildUpdateParticipantDto();
    });

    when('I attempt to update a participant', async () => {
      try {
        await handler.execute(
          new UpdateParticipantCommand(updateParticipantDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Participant not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      updateParticipantDto = ParticipantBuilder()
        .alpha()
        .buildUpdateParticipantDto();
    });

    and('the returned source populates a valid participant', () => {
      // we know this to be true
    });

    and('the source does NOT exist in our DB', () => {
      // we know this to be true
    });

    when('I attempt to update a participant', async () => {
      try {
        await handler.execute(
          new UpdateParticipantCommand(updateParticipantDto)
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
      updateParticipantDto = ParticipantBuilder()
        .invalidSource()
        .buildUpdateParticipantDto();
    });

    and('the returned source does not populate a valid Participant', () => {
      // this occurs during
    });

    when('I attempt to update a participant', async () => {
      try {
        await handler.execute(
          new UpdateParticipantCommand(updateParticipantDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });

  test('Fail; Source is an invalid status to be updated in admin', ({
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
      updateParticipantDto = ParticipantBuilder()
        .invalidStatus()
        .buildUpdateParticipantDto();
    });

    when('I attempt to update a participant', async () => {
      try {
        await handler.execute(
          new UpdateParticipantCommand(updateParticipantDto)
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
