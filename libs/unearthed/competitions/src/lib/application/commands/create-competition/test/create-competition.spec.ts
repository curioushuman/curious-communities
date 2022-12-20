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
  CreateCompetitionCommand,
  CreateCompetitionHandler,
} from '../create-competition.command';
import { CompetitionRepository } from '../../../../adapter/ports/competition.repository';
import { FakeCompetitionRepository } from '../../../../adapter/implementations/fake/fake.competition.repository';
import { CompetitionSourceRepository } from '../../../../adapter/ports/competition-source.repository';
import { FakeCompetitionSourceRepository } from '../../../../adapter/implementations/fake/fake.competition-source.repository';
import { Competition } from '../../../../domain/entities/competition';
import { CompetitionBuilder } from '../../../../test/builders/competition.builder';
import { CreateCompetitionDto } from '../create-competition.dto';

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
  let repository: FakeCompetitionRepository;
  let handler: CreateCompetitionHandler;
  let createCompetitionDto: CreateCompetitionDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCompetitionHandler,
        LoggableLogger,
        { provide: CompetitionRepository, useClass: FakeCompetitionRepository },
        {
          provide: CompetitionSourceRepository,
          useClass: FakeCompetitionSourceRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<CompetitionRepository>(
      CompetitionRepository
    ) as FakeCompetitionRepository;
    handler = moduleRef.get<CreateCompetitionHandler>(CreateCompetitionHandler);
  });

  test('Successfully creating a competition', ({ given, and, when, then }) => {
    let competitions: Competition[];
    let competitionsBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      createCompetitionDto = CompetitionBuilder()
        .beta()
        .buildCreateCompetitionDto();
    });

    and('the returned source populates a valid competition', () => {
      // we know this to be true
      // out of scope for this test
    });

    and('the source does not already exist in our DB', async () => {
      competitions = await executeTask(repository.all());
      competitionsBefore = competitions.length;
    });

    when('I attempt to create a competition', async () => {
      result = await handler.execute(
        new CreateCompetitionCommand(createCompetitionDto)
      );
    });

    then('a new record should have been created', async () => {
      competitions = await executeTask(repository.all());
      expect(competitions.length).toEqual(competitionsBefore + 1);
    });

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let error: Error;

    given('no record exists that matches our request', () => {
      createCompetitionDto = CompetitionBuilder()
        .noMatchingSource()
        .buildCreateCompetitionDto();
    });

    when('I attempt to create a competition', async () => {
      try {
        await handler.execute(
          new CreateCompetitionCommand(createCompetitionDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Source does not translate into a valid Competition', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      createCompetitionDto = CompetitionBuilder()
        .invalidSource()
        .buildCreateCompetitionDto();
    });

    and('the returned source does not populate a valid Competition', () => {
      // this occurs during
    });

    when('I attempt to create a competition', async () => {
      try {
        await handler.execute(
          new CreateCompetitionCommand(createCompetitionDto)
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

    and('the returned source populates a valid competition', () => {
      // known
    });

    and('the source DOES already exist in our DB', () => {
      createCompetitionDto = CompetitionBuilder()
        .exists()
        .buildCreateCompetitionDto();
    });

    when('I attempt to create a competition', async () => {
      try {
        await handler.execute(
          new CreateCompetitionCommand(createCompetitionDto)
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
      createCompetitionDto = CompetitionBuilder()
        .invalidStatus()
        .buildCreateCompetitionDto();
    });

    when('I attempt to create a competition', async () => {
      try {
        await handler.execute(
          new CreateCompetitionCommand(createCompetitionDto)
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
