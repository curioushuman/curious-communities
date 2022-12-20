import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { CompetitionSource } from '../../../domain/entities/competition-source';
import { CompetitionSourceRepository } from '../../ports/competition-source.repository';
import { CompetitionSourceBuilder } from '../../../test/builders/competition-source.builder';
import { FindCompetitionSourceDto } from '../../../application/queries/find-competition-source/find-competition-source.dto';

@Injectable()
export class FakeCompetitionSourceRepository
  implements CompetitionSourceRepository
{
  private competitionSources: CompetitionSource[] = [];

  constructor() {
    this.competitionSources.push(CompetitionSourceBuilder().exists().build());
    this.competitionSources.push(
      CompetitionSourceBuilder().invalidSource().buildNoCheck()
    );
    this.competitionSources.push(CompetitionSourceBuilder().alpha().build());
    this.competitionSources.push(CompetitionSourceBuilder().beta().build());
    this.competitionSources.push(
      CompetitionSourceBuilder().invalidStatus().build()
    );
  }

  findOne = (
    dto: FindCompetitionSourceDto
  ): TE.TaskEither<Error, CompetitionSource> => {
    const { id } = dto;
    return TE.tryCatch(
      async () => {
        const competitionSource = this.competitionSources.find(
          (cs) => cs.id === id
        );
        return pipe(
          competitionSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Competition source with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (source) => CompetitionSource.check(source)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };
}
