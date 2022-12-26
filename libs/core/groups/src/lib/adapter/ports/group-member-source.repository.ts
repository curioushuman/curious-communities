import { TaskEither } from 'fp-ts/lib/TaskEither';

import { GroupMemberSource } from '../../domain/entities/group-member-source';
import { FindGroupMemberSourceDto } from '../../application/queries/find-group-member-source/find-group-member-source.dto';

export abstract class GroupMemberSourceRepository {
  abstract findOne(
    dto: FindGroupMemberSourceDto
  ): TaskEither<Error, GroupMemberSource>;
}
