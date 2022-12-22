import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import {
  //   ErrorFactory,
  //   FakeRepositoryErrorFactory,
  //   RepositoryItemConflictError,
  //   SourceInvalidError,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { ParticipantModule } from '../../../test/participant.module.fake';
import { UpdateParticipantModule } from '../../../update-participant.module';
import { UpdateParticipantRequestDto } from '../dto/update-participant.request.dto';
import { ParticipantBuilder } from '../../../test/builders/participant.builder';
import { UpdateParticipantController } from '../update-participant.controller';
import { FakeParticipantRepository } from '../../../adapter/implementations/fake/fake.participant.repository';
import { ParticipantRepository } from '../../../adapter/ports/participant.repository';
import { ParticipantSourceBuilder } from '../../../test/builders/participant-source.builder';
import { ParticipantSource } from '../../../domain/entities/participant-source';
import { ParticipantSourceRepository } from '../../../adapter/ports/participant-source.repository';
import { FakeParticipantSourceRepository } from '../../../adapter/implementations/fake/fake.participant-source.repository';

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
    UpdateParticipantModule.applyDefaults(app);
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
    let updatedParticipantSource: ParticipantSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateParticipantDto: UpdateParticipantRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      updateParticipantDto = ParticipantBuilder()
        .exists()
        .buildUpdateParticipantRequestDto();
    });

    and('a matching record is found at the source', async () => {
      updatedParticipantSource = ParticipantSourceBuilder().updated().build();
      // save it to our fake repo
      executeTask(participantSourcerepository.save(updatedParticipantSource));
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

  test('Fail; Invalid request', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateParticipantDto: UpdateParticipantRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      updateParticipantDto = ParticipantBuilder()
        .invalid()
        .buildUpdateParticipantRequestDto();
    });

    when('I attempt to update a participant', async () => {
      try {
        result = await controller.update(updateParticipantDto);
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
