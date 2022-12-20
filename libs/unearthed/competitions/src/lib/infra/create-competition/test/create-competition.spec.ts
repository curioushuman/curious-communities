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

import { CompetitionsModule } from '../../../test/competitions.module.fake';
import { CreateCompetitionModule } from '../../../create-competition.module';
import { CreateCompetitionRequestDto } from '../dto/create-competition.request.dto';
import { Competition } from '../../../domain/entities/competition';
import { CompetitionBuilder } from '../../../test/builders/competition.builder';
import { CreateCompetitionController } from '../../../infra/create-competition/create-competition.controller';
import { FakeCompetitionRepository } from '../../../adapter/implementations/fake/fake.competition.repository';
import { CompetitionRepository } from '../../../adapter/ports/competition.repository';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-competition.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeCompetitionRepository;
  let controller: CreateCompetitionController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CompetitionsModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    CreateCompetitionModule.applyDefaults(app);
    repository = moduleRef.get<CompetitionRepository>(
      CompetitionRepository
    ) as FakeCompetitionRepository;
    controller = moduleRef.get<CreateCompetitionController>(
      CreateCompetitionController
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a competition', ({ given, and, when, then }) => {
    let competitions: Competition[];
    let competitionsBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let createCompetitionDto: CreateCompetitionRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      createCompetitionDto = CompetitionBuilder()
        .beta()
        .buildCreateCompetitionRequestDto();
    });

    and('a matching record is found at the source', async () => {
      competitions = await executeTask(repository.all());
      competitionsBefore = competitions.length;
    });

    when('I attempt to create a competition', async () => {
      try {
        result = await controller.create(createCompetitionDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'a new record should have been created in the repository',
      async () => {
        competitions = await executeTask(repository.all());
        expect(competitions.length).toEqual(competitionsBefore + 1);
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
    let createCompetitionDto: CreateCompetitionRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      createCompetitionDto = CompetitionBuilder()
        .invalid()
        .buildCreateCompetitionRequestDto();
    });

    when('I attempt to create a competition', async () => {
      try {
        result = await controller.create(createCompetitionDto);
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
