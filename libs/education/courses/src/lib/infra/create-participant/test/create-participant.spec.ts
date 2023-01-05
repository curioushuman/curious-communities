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
import { CreateParticipantModule } from '../../../create-participant.module';
import { CreateParticipantRequestDto } from '../dto/create-participant.request.dto';
import { Participant } from '../../../domain/entities/participant';
import { ParticipantBuilder } from '../../../test/builders/participant.builder';
import { CreateParticipantController } from '../../../infra/create-participant/create-participant.controller';
import { FakeParticipantRepository } from '../../../adapter/implementations/fake/fake.participant.repository';
import { ParticipantRepository } from '../../../adapter/ports/participant.repository';

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

const feature = loadFeature('./create-participant.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeParticipantRepository;
  let controller: CreateParticipantController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ParticipantModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    CreateParticipantModule.applyDefaults(app);
    repository = moduleRef.get<ParticipantRepository>(
      ParticipantRepository
    ) as FakeParticipantRepository;
    controller = moduleRef.get<CreateParticipantController>(
      CreateParticipantController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a participant', ({ given, and, when, then }) => {
    let participants: Participant[];
    let participantsBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let createParticipantDto: CreateParticipantRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      // we know this to exist in our fake repo
      createParticipantDto = ParticipantBuilder()
        .beta()
        .buildCreateParticipantRequestDto();

      participants = await executeTask(repository.all());
      participantsBefore = participants.length;
    });

    when('I attempt to create a participant', async () => {
      try {
        result = await controller.create(createParticipantDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
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
    let createParticipantDto: CreateParticipantRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      createParticipantDto = ParticipantBuilder()
        .invalidOther()
        .buildCreateParticipantRequestDto();
    });

    when('I attempt to create a participant', async () => {
      try {
        await controller.create(createParticipantDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
