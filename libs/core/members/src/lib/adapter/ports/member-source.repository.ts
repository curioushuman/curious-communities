import { TaskEither } from 'fp-ts/lib/TaskEither';

import { MemberSource } from '../../domain/entities/member-source';
import { FindMemberSourceDto } from '../../application/queries/find-member-source/find-member-source.dto';

export abstract class MemberSourceRepository {
  abstract findOne(dto: FindMemberSourceDto): TaskEither<Error, MemberSource>;
}
