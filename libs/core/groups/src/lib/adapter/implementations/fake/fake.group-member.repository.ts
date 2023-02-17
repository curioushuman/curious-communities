import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  GroupMember,
  GroupMemberBase,
  GroupMemberIdentifier,
} from '../../../domain/entities/group-member';
import {
  GroupMemberFindMethod,
  GroupMemberRepository,
} from '../../ports/group-member.repository';
import { GroupMemberBuilder } from '../../../test/builders/group-member.builder';
import { GroupMemberStatus } from '../../../domain/value-objects/group-member-status';
import { ParticipantId } from '../../../domain/value-objects/participant-id';
import { CourseGroupMember } from '../../../domain/entities/course-group-member';
import { MemberId } from '../../../domain/value-objects/member-id';
import { GroupId } from '../../../domain/value-objects/group-id';
import { MemberBuilder } from '../../../test/builders/member.builder';

@Injectable()
export class FakeGroupMemberRepository implements GroupMemberRepository {
  private groupMembers: GroupMember[] = [];

  private restatusGroupMember<T extends GroupMember | GroupMemberBase>(
    groupMember: T
  ): T {
    groupMember.status = 'pending' as GroupMemberStatus;
    return groupMember;
  }

  constructor() {
    const memberExists = MemberBuilder().exists().build();
    const memberUpdated = MemberBuilder().updated().build();
    this.groupMembers.push(
      GroupMemberBuilder().exists().buildNoCheck(memberExists)
    );
    this.groupMembers.push(
      GroupMemberBuilder()
        .existsAlpha()
        .buildCourseGroupMemberNoCheck(memberExists)
    );
    this.groupMembers.push(
      this.restatusGroupMember(
        GroupMemberBuilder().updated().buildNoCheck(memberUpdated)
      )
    );
    this.groupMembers.push(
      this.restatusGroupMember(
        GroupMemberBuilder().updatedAlpha().buildNoCheck(memberUpdated)
      )
    );
    this.groupMembers.push(
      this.restatusGroupMember(
        GroupMemberBuilder()
          .updatedCourse()
          .buildCourseGroupMemberNoCheck(memberUpdated)
      )
    );
    this.groupMembers.push(
      this.restatusGroupMember(
        GroupMemberBuilder()
          .updatedCourseAlpha()
          .buildCourseGroupMemberNoCheck(memberUpdated)
      )
    );
    const invalidSource = GroupMemberBuilder().invalidOther().buildNoCheck();
    invalidSource.status = 'pending' as GroupMemberStatus;
    this.groupMembers.push(invalidSource);
    // console.log(this.groupMembers);
  }

  /**
   * Find by member ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneByMemberId = (props: {
    value: MemberId;
    parentId: GroupId;
  }): TE.TaskEither<Error, GroupMember> => {
    return TE.tryCatch(
      async () => {
        const memberId = MemberId.check(props.value);
        const groupMember = this.groupMembers.find(
          (gm) =>
            (gm.group.id === props.parentId || gm.groupId === props.parentId) &&
            gm.member.id === memberId
        );
        return pipe(
          groupMember,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMember with memberId ${memberId} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (groupMember) => groupMember
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Find by ID from a participant
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneByParticipantId = (props: {
    value: ParticipantId;
    parentId: GroupId;
  }): TE.TaskEither<Error, CourseGroupMember> => {
    return TE.tryCatch(
      async () => {
        const participantId = ParticipantId.check(props.value);
        const groupMember = this.groupMembers.find(
          (gm) =>
            (gm.group.id === props.parentId || gm.groupId === props.parentId) &&
            'participantId' in gm &&
            gm.participantId === participantId
        );
        return pipe(
          groupMember,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMember with participantId ${participantId} not found`
              );
            },
            // if it has a participantId, it's a CourseGroupMember
            (groupMember) => groupMember as CourseGroupMember
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<GroupMemberIdentifier, GroupMemberFindMethod> = {
    // id: this.findOneById,
    memberId: this.findOneByMemberId,
    participantId: this.findOneByParticipantId,
  };

  findOne = (identifier: GroupMemberIdentifier): GroupMemberFindMethod => {
    return this.findOneBy[identifier];
  };

  save = (groupMember: GroupMember): TE.TaskEither<Error, GroupMember> => {
    return TE.tryCatch(
      async () => {
        const groupMemberExists = this.groupMembers.find(
          (cs) => cs.id === groupMember.id
        );
        if (groupMemberExists) {
          this.groupMembers = this.groupMembers.map((cs) =>
            cs.id === groupMember.id ? groupMember : cs
          );
        } else {
          this.groupMembers.push(groupMember);
        }
        return groupMember;
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, GroupMember[]> => {
    return TE.right(this.groupMembers);
  };
}
