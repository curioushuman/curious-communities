import { TaskEither } from 'fp-ts/lib/TaskEither';

import { GroupSource } from '../../domain/entities/group-source';
import { FindGroupSourceDto } from '../../application/queries/find-group-source/find-group-source.dto';

export abstract class GroupSourceRepository {
  abstract findOne(dto: FindGroupSourceDto): TaskEither<Error, GroupSource>;
}
