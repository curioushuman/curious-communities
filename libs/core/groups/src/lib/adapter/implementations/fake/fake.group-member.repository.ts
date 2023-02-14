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
import { GroupMemberSourceIdSourceValue } from '../../../domain/value-objects/group-member-source-id-source';
import { prepareExternalIdSource } from '@curioushuman/common';
import { Source } from '../../../domain/value-objects/source';
import { GroupMemberSourceId } from '../../../domain/value-objects/group-member-source-id';
import { GroupMemberStatus } from '../../../domain/value-objects/group-member-status';
import { ParticipantId } from '../../../domain/value-objects/participant-id';
import { CourseGroupMember } from '../../../domain/entities/course-group-member';
import { GroupMemberName } from '../../../domain/value-objects/group-member-name';

@Injectable()
export class FakeGroupMemberRepository implements GroupMemberRepository {
  private groupMembers: GroupMember[] = [];

  private renameGroupMember<T extends GroupMember | GroupMemberBase>(
    groupMember: T
  ): T {
    groupMember.name = 'Bland base name' as GroupMemberName;
    return groupMember;
  }

  constructor() {
    this.groupMembers.push(GroupMemberBuilder().exists().buildNoCheck());
    this.groupMembers.push(
      this.renameGroupMember(GroupMemberBuilder().updated().buildNoCheck())
    );
    this.groupMembers.push(
      this.renameGroupMember(GroupMemberBuilder().updatedAlpha().buildNoCheck())
    );
    this.groupMembers.push(
      this.renameGroupMember(
        GroupMemberBuilder().updatedCourse().buildCourseGroupMemberNoCheck()
      )
    );
    this.groupMembers.push(
      this.renameGroupMember(
        GroupMemberBuilder()
          .updatedCourseAlpha()
          .buildCourseGroupMemberNoCheck()
      )
    );
    this.groupMembers.push(
      GroupMemberBuilder().existsAlpha().buildCourseGroupMemberNoCheck()
    );
    const invalidSource = GroupMemberBuilder().invalidOther().buildNoCheck();
    invalidSource.status = 'pending' as GroupMemberStatus;
    this.groupMembers.push(invalidSource);
    // console.log(this.groupMembers);
  }

  /**
   * Find by internal ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  // findOneById = (value: GroupMemberId): TE.TaskEither<Error, GroupMember> => {
  //   return TE.tryCatch(
  //     async () => {
  //       const id = GroupMemberId.check(value);
  //       const groupMember = this.groupMembers.find((cs) => cs.id === id);
  //       return pipe(
  //         groupMember,
  //         O.fromNullable,
  //         O.fold(
  //           () => {
  //             // this mimics an API or DB call throwing an error
  //             throw new NotFoundException(
  //               `GroupMember with id ${id} not found`
  //             );
  //           },
  //           // this mimics the fact that all non-fake adapters
  //           // will come with a mapper, which will perform a check
  //           // prior to return
  //           (groupMember) => groupMember
  //         )
  //       );
  //     },
  //     (reason: unknown) => reason as Error
  //   );
  // };

  /**
   * Find by ID from a particular source
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneByIdSourceValue = (
    value: GroupMemberSourceIdSourceValue
  ): TE.TaskEither<Error, GroupMember> => {
    return TE.tryCatch(
      async () => {
        const idSourceValue = GroupMemberSourceIdSourceValue.check(value);
        const idSource = prepareExternalIdSource(
          idSourceValue,
          GroupMemberSourceId,
          Source
        );
        const groupMember = this.groupMembers.find((cs) => {
          const matches = cs.sourceIds.filter(
            (sId) => sId.id === idSource.id && sId.source === idSource.source
          );
          return matches.length > 0;
        });
        return pipe(
          groupMember,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMember with idSource ${idSourceValue} not found`
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
  findOneByParticipantId = (
    value: ParticipantId
  ): TE.TaskEither<Error, CourseGroupMember> => {
    return TE.tryCatch(
      async () => {
        const groupMember = this.groupMembers.find(
          (gm) => 'participantId' in gm && gm.participantId === value
        );
        return pipe(
          groupMember,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMember with participantId ${value} not found`
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
    idSourceValue: this.findOneByIdSourceValue,
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
