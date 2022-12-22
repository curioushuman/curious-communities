import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { GroupMember } from '../../../domain/entities/group-member';
import { GroupMemberRepository } from '../../ports/group-member.repository';
import { GroupMemberBuilder } from '../../../test/builders/group-member.builder';
import { GroupMemberId } from '../../../domain/value-objects/group-member-id';

@Injectable()
export class FakeGroupMemberRepository implements GroupMemberRepository {
  private groupMembers: GroupMember[] = [];

  constructor() {
    this.groupMembers.push(GroupMemberBuilder().exists().build());
  }

  findById = (id: GroupMemberId): TE.TaskEither<Error, GroupMember> => {
    return TE.tryCatch(
      async () => {
        const groupMember = this.groupMembers.find((cs) => cs.id === id);
        return pipe(
          groupMember,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMember with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (groupMember) => GroupMember.check(groupMember)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  checkById = (id: GroupMemberId): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const groupMember = this.groupMembers.find((cs) => cs.id === id);
        return pipe(
          groupMember,
          O.fromNullable,
          O.fold(
            () => false,
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_) => true
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  save = (groupMember: GroupMember): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const GroupMemberExists = this.groupMembers.find(
          (cs) => cs.id === groupMember.id
        );
        if (GroupMemberExists) {
          this.groupMembers = this.groupMembers.map((cs) =>
            cs.id === groupMember.id ? groupMember : cs
          );
        } else {
          this.groupMembers.push(groupMember);
        }
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, GroupMember[]> => {
    return TE.right(this.groupMembers);
  };
}
