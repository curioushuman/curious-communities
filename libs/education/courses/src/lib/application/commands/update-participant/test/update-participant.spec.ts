import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
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
import { ParticipantSourceBuilder } from '../../../../test/builders/participant-source.builder';
import { ParticipantRepositoryErrorFactory } from '../../../../adapter/ports/participant.repository.error-factory';
import { ParticipantSourceRepositoryErrorFactory } from '../../../../adapter/ports/participant-source.repository.error-factory';

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
          provide: ParticipantRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
        {
          provide: ParticipantSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<ParticipantRepository>(
      ParticipantRepository
    ) as FakeParticipantRepository;
    handler = moduleRef.get<UpdateParticipantHandler>(UpdateParticipantHandler);
  });

  test('Successfully updating a participant', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      updateParticipantDto = ParticipantBuilder()
        .updated()
        .buildUpdateParticipantDto();
    });

    and('the returned source populates a valid participant', async () => {
      // above
    });

    and('the source does exist in our DB', async () => {
      const participants = await executeTask(repository.all());
      const participantBefore = participants.find(
        (participant) => participant.id === updateParticipantDto.participant.id
      );
      expect(participantBefore).toBeDefined();
      if (participantBefore) {
        expect(participantBefore.status).not.toEqual(
          updateParticipantDto.participantSource.status
        );
      }
    });

    when('I attempt to update a participant', async () => {
      try {
        result = await handler.execute(
          new UpdateParticipantCommand(updateParticipantDto)
        );
      } catch (err) {
        expect(err).toBeUndefined();
      }
    });

    then(
      'the related record should have been updated in the repository',
      async () => {
        const participants = await executeTask(repository.all());
        const participantAfter = participants.find(
          (participant) =>
            participant.id === updateParticipantDto.participant.id
        );
        expect(participantAfter).toBeDefined();
        if (participantAfter) {
          expect(participantAfter.status).toEqual(
            updateParticipantDto.participantSource.status
          );
        }
      }
    );

    and('saved participant is returned', () => {
      expect(result.id).toBeDefined();
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
      const participantSource = ParticipantSourceBuilder()
        .invalidSource()
        .buildNoCheck();
      updateParticipantDto = ParticipantBuilder()
        .invalidSource()
        .buildUpdateParticipantDto(participantSource);
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
        .invalidOther()
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
