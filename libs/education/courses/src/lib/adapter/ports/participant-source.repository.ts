import { TaskEither } from 'fp-ts/lib/TaskEither';

import { ParticipantSource } from '../../domain/entities/participant-source';
import { FindParticipantSourceDto } from '../../application/queries/find-participant-source/find-participant-source.dto';

export abstract class ParticipantSourceRepository {
  abstract findOne(
    dto: FindParticipantSourceDto
  ): TaskEither<Error, ParticipantSource>;
}
