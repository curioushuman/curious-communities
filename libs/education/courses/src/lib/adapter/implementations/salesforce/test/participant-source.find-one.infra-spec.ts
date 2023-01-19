import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { ParticipantSourceRepository } from '../../../ports/participant-source.repository';
import { ParticipantSource } from '../../../../domain/entities/participant-source';
import { ParticipantSourceId } from '../../../../domain/value-objects/participant-source-id';
import { SalesforceApiHttpConfigService } from '../http-config.service';
import { SalesforceApiParticipantSourceRepository } from '../participant-source.repository';
import { ParticipantSourceRepositoryErrorFactory } from '../../../ports/participant-source.repository.error-factory';
import { SalesforceApiRepositoryErrorFactory } from '../repository.error-factory';
import { ParticipantSourceBuilder } from '../../../../test/builders/participant-source.builder';

/**
 * INTEGRATION TEST
 * SUT = the findOne function OF an external repository
 * i.e. are we actually connecting with and getting data from SF
 *
 * Scope
 * - repository functions and behaviours
 * - changes to API/data structure
 * - handling of their various responses/errors
 */

const feature = loadFeature('./participant-source.find-one.infra.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: SalesforceApiParticipantSourceRepository;
  let participantSourceId: ParticipantSourceId;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        HttpModule.registerAsync({
          useClass: SalesforceApiHttpConfigService,
        }),
      ],
      providers: [
        LoggableLogger,
        {
          provide: ParticipantSourceRepository,
          useClass: SalesforceApiParticipantSourceRepository,
        },
        {
          provide: ParticipantSourceRepositoryErrorFactory,
          useClass: SalesforceApiRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<ParticipantSourceRepository>(
      ParticipantSourceRepository
    ) as SalesforceApiParticipantSourceRepository;
  });

  test('Successfully find one participant source', ({
    given,
    and,
    when,
    then,
  }) => {
    let result: ParticipantSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record exists at the source', async () => {
      // this is the simpler version
      // I know this ID exists, it'll do for now
      participantSourceId = 'a0n9s000000EEvFAAW' as ParticipantSourceId;
    });

    when('I request the source by ID', async () => {
      try {
        result = await executeTask(repository.findOneById(participantSourceId));
      } catch (err) {
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('a source corresponding to that ID should be returned', () => {
      expect(result.id).toEqual(participantSourceId);
    });
  });

  test('Fail; Source not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let result: ParticipantSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record DOES NOT exist at the source', () => {
      participantSourceId = ParticipantSourceBuilder()
        .noMatchingSource()
        .build().id;
    });

    when('I request the source by ID', async () => {
      try {
        result = await executeTask(repository.findOneById(participantSourceId));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive an Error', () => {
      // NOTE: we don't test for our application specific errors here
      // as they are one level above the repository
      expect(error).toBeInstanceOf(Error);
    });

    and('no result is returned', () => {
      expect(result).toBeUndefined();
    });
  });
});
