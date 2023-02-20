import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  GroupMemberSource,
  GroupMemberSourceForCreate,
  GroupMemberSourceIdentifier,
} from '../../../domain/entities/group-member-source';
import {
  GroupMemberSourceFindMethod,
  GroupMemberSourceRepositoryReadWrite,
} from '../../ports/group-member-source.repository';
import { GroupMemberSourceBuilder } from '../../../test/builders/group-member-source.builder';
import config from '../../../static/config';
import { Source } from '../../../domain/value-objects/source';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { MemberEmail } from '../../../domain/value-objects/member-email';

@Injectable()
export class FakeGroupMemberSourceRepository
  implements GroupMemberSourceRepositoryReadWrite
{
  private groupMemberSources: GroupMemberSource[] = [];

  constructor() {
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().exists().buildNoCheck()
    );
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().updated().buildNoCheck()
    );
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().alpha().buildNoCheck()
    );
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().beta().buildNoCheck()
    );
    // console.log(this.groupMemberSources);
  }

  /**
   * Find by source ID
   */
  findOneByMemberId = (props: {
    value: MemberSourceId;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const memberId = MemberSourceId.check(props.value);
        const groupId = GroupSourceId.check(props.parentId);
        const groupSource = this.groupMemberSources.find(
          (gms) => gms.memberId === memberId && gms.groupId === groupId
        );
        return pipe(
          groupSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMemberSource with memberId ${memberId} not found`
              );
            },
            (gs) => gs
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Find by source ID
   */
  findOneByMemberEmail = (props: {
    value: MemberEmail;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const email = MemberEmail.check(props.value);
        const groupId = GroupSourceId.check(props.parentId);
        const groupSource = this.groupMemberSources.find(
          (cs) => cs.memberEmail === email && cs.groupId === groupId
        );
        return pipe(
          groupSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMemberSource with email ${email} not found`
              );
            },
            (gs) => gs
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<GroupMemberSourceIdentifier, GroupMemberSourceFindMethod> =
    {
      memberId: this.findOneByMemberId,
      memberEmail: this.findOneByMemberEmail,
    };

  findOne = (
    identifier: GroupMemberSourceIdentifier
  ): GroupMemberSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  create = (
    groupMember: GroupMemberSourceForCreate
  ): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const savedGroupMemberSource = {
          ...groupMember,
          source: config.defaults.primaryAccountSource as Source,
          memberEmail: 'nomatters@email.com' as MemberEmail,
        };
        this.groupMemberSources.push(savedGroupMemberSource);
        return savedGroupMemberSource;
      },
      (reason: unknown) => reason as Error
    );
  };

  update = (
    groupMember: GroupMemberSource
  ): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        // we don't do updates for this object type
        return groupMember;
      },
      (reason: unknown) => reason as Error
    );
  };

  delete = (groupMember: GroupMemberSource): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        // extract all elements from the DB array
        const remainingGroupMembers = this.groupMemberSources.splice(
          0,
          this.groupMemberSources.length
        );

        // add them back in, only if they don't match the ID of the groupMember
        remainingGroupMembers.forEach((gm) => {
          if (
            gm.memberId !== groupMember.memberId &&
            gm.groupId !== groupMember.groupId
          ) {
            this.groupMemberSources.push(gm);
          }
        });
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, GroupMemberSource[]> => {
    return TE.right(this.groupMemberSources);
  };
}
