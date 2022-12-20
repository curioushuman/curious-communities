import { TaskEither } from 'fp-ts/lib/TaskEither';

import { CompetitionSource } from '../../domain/entities/competition-source';
import { FindCompetitionSourceDto } from '../../application/queries/find-competition-source/find-competition-source.dto';

export abstract class CompetitionSourceRepository {
  abstract findOne(
    dto: FindCompetitionSourceDto
  ): TaskEither<Error, CompetitionSource>;
}
