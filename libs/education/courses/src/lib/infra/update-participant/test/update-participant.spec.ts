import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import {
  RepositoryItemNotFoundError,
  RequestInvalidError,
  SourceInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { ParticipantModule } from '../../../test/participant.module.fake';
import { UpdateParticipantRequestDto } from '../dto/update-participant.request.dto';
import { ParticipantBuilder } from '../../../test/builders/participant.builder';
import { UpdateParticipantController } from '../update-participant.controller';
import { FakeParticipantRepository } from '../../../adapter/implementations/fake/fake.participant.repository';
import { ParticipantRepository } from '../../../adapter/ports/participant.repository';
import { ParticipantSourceBuilder } from '../../../test/builders/participant-source.builder';
import { ParticipantSource } from '../../../domain/entities/participant-source';
import { ParticipantSourceRepository } from '../../../adapter/ports/participant-source.repository';
import { FakeParticipantSourceRepository } from '../../../adapter/implementations/fake/fake.participant-source.repository';
import { prepareExternalIdSourceValue } from '@curioushuman/common';

/**
 * INTEGRATION TEST
 * SUT = the controller, the command handler
 *
 * NOTES:
 * - the controller does so little, so rather than create a separate unit test
 *  for it, we'll just test it here
 *
 * TODO
 * - [ ] need to mock an error for internal error testing
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-participant.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeParticipantRepository;
  let participantSourcerepository: FakeParticipantSourceRepository;
  let controller: UpdateParticipantController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ParticipantModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    ParticipantModule.applyDefaults(app);
    repository = moduleRef.get<ParticipantRepository>(
      ParticipantRepository
    ) as FakeParticipantRepository;
    participantSourcerepository = moduleRef.get<ParticipantSourceRepository>(
      ParticipantSourceRepository
    ) as FakeParticipantSourceRepository;
    controller = moduleRef.get<UpdateParticipantController>(
      UpdateParticipantController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully updating a participant', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateParticipantDto: UpdateParticipantRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      updateParticipantDto = ParticipantBuilder()
        .updatedAlpha()
        .buildUpdateParticipantRequestDto();
    });

    when('I attempt to update a participant', async () => {
      try {
        result = await controller.update(updateParticipantDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the related record should have been updated', async () => {
      const participants = await executeTask(repository.all());
      const participantAfter = participants.find(
        (participant) => updateParticipantDto.participant?.id === participant.id
      );
      expect(participantAfter).toBeDefined();
      if (participantAfter) {
        expect(participantAfter.status).toEqual(
          updateParticipantDto.participant?.status
        );
      }
    });

    and('saved participant is returned within payload', () => {
      expect(result.detail.id).toBeDefined();
      expect(result.event).toEqual('updated');
      expect(result.outcome).toEqual('success');
    });
  });

  test('Successfully updating a participant from source', ({
    given,
    and,
    when,
    then,
  }) => {
    let updatedParticipantSource: ParticipantSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateParticipantDto: UpdateParticipantRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      updateParticipantDto = ParticipantBuilder()
        .updated()
        .buildUpdateFromSourceParticipantRequestDto();
    });

    and('a matching record is found at the source', async () => {
      updatedParticipantSource = ParticipantSourceBuilder().updated().build();
      // save it to our fake repo
      executeTask(participantSourcerepository.save(updatedParticipantSource));
      const participants = await executeTask(repository.all());
      const participantBefore = participants.find(
        (participant) =>
          updateParticipantDto.idSourceValue ===
          prepareExternalIdSourceValue(
            participant.sourceIds[0].id,
            participant.sourceIds[0].source
          )
      );
      expect(participantBefore).toBeDefined();
      if (participantBefore) {
        expect(participantBefore.status).not.toEqual(
          updatedParticipantSource.status
        );
      }
    });

    when('I attempt to update a participant', async () => {
      try {
        result = await controller.update(updateParticipantDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'the related record should have been updated in the repository',
      async () => {
        const participants = await executeTask(repository.all());
        const participantAfter = participants.find(
          (participant) =>
            updateParticipantDto.idSourceValue ===
            prepareExternalIdSourceValue(
              participant.sourceIds[0].id,
              participant.sourceIds[0].source
            )
        );
        expect(participantAfter).toBeDefined();
        if (participantAfter) {
          // NOTE: cancelled is converted to disabled
          expect(participantAfter.status).toEqual('disabled');
        }
      }
    );

    and('saved participant is returned within payload', () => {
      expect(result.detail.id).toBeDefined();
      expect(result.event).toEqual('updated');
      expect(result.outcome).toEqual('success');
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let updateParticipantDto: UpdateParticipantRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      updateParticipantDto = ParticipantBuilder()
        .invalid()
        .buildUpdateFromSourceParticipantRequestDto();
    });

    when('I attempt to update a participant', async () => {
      try {
        await controller.update(updateParticipantDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let updateParticipantDto: UpdateParticipantRequestDto;
    let error: Error;

    given('no record exists that matches our request', () => {
      // we know this to exist in our fake repo
      updateParticipantDto = ParticipantBuilder()
        .noMatchingSource()
        .buildUpdateFromSourceParticipantRequestDto();
    });

    when('I attempt to update a participant', async () => {
      try {
        await controller.update(updateParticipantDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });

  test('Fail; Participant not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateParticipantDto: UpdateParticipantRequestDto;
    let error: Error;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      updateParticipantDto = ParticipantBuilder()
        .doesntExist()
        .buildUpdateFromSourceParticipantRequestDto();
    });

    and('the returned source populates a valid participant', () => {
      expect(result).toEqual(undefined);
    });

    and('the source does NOT exist in our DB', () => {
      expect(result).toEqual(undefined);
    });

    when('I attempt to update a participant', async () => {
      try {
        result = await controller.update(updateParticipantDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });

  test('Fail; Source is an invalid status to be updated in admin', ({
    given,
    and,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateParticipantDto: UpdateParticipantRequestDto;
    let error: Error;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      updateParticipantDto = ParticipantBuilder()
        .invalidOther()
        .buildUpdateFromSourceParticipantRequestDto();
    });

    and('the returned source has an invalid status', () => {
      expect(result).toEqual(undefined);
    });

    when('I attempt to update a participant', async () => {
      try {
        result = await controller.update(updateParticipantDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
