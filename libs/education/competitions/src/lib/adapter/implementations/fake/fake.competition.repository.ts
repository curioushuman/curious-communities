import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { Slug } from '@curioushuman/common';

import { Competition } from '../../../domain/entities/competition';
import { CompetitionRepository } from '../../ports/competition.repository';
import { CompetitionBuilder } from '../../../test/builders/competition.builder';
import { CompetitionId } from '../../../domain/value-objects/competition-id';

@Injectable()
export class FakeCompetitionRepository implements CompetitionRepository {
  private competitions: Competition[] = [];

  constructor() {
    this.competitions.push(CompetitionBuilder().exists().build());
  }

  findById = (id: CompetitionId): TE.TaskEither<Error, Competition> => {
    return TE.tryCatch(
      async () => {
        const competition = this.competitions.find((cs) => cs.id === id);
        return pipe(
          competition,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Competition with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (competition) => Competition.check(competition)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  findBySlug = (slug: Slug): TE.TaskEither<Error, Competition> => {
    return TE.tryCatch(
      async () => {
        const competition = this.competitions.find((cs) => cs.slug === slug);
        return pipe(
          competition,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Competition with slug ${slug} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (competition) => Competition.check(competition)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  save = (competition: Competition): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        this.competitions.push(competition);
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, Competition[]> => {
    return TE.right(this.competitions);
  };
}
