import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  GroupMember,
  GroupMemberBase,
  GroupMemberIdentifier,
  prepareGroupMemberExternalIdSource,
} from '../../../domain/entities/group-member';
import {
  GroupMemberFindMethod,
  GroupMemberRepository,
} from '../../ports/group-member.repository';
import { GroupMemberBuilder } from '../../../test/builders/group-member.builder';
import { GroupMemberId } from '../../../domain/value-objects/group-member-id';
import {
  GroupMemberSourceIdSource,
  GroupMemberSourceIdSourceValue,
} from '../../../domain/value-objects/group-member-source-id-source';
import { GroupBuilder } from '../../../test/builders/group.builder';

@Injectable()
export class FakeGroupMemberRepository implements GroupMemberRepository {
  private groupMembers: GroupMember[] = [];

  constructor() {
    this.groupMembers.push(GroupMemberBuilder().exists().build());
  }

  /**
   * Find by internal ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneById = (value: GroupMemberId): TE.TaskEither<Error, GroupMember> => {
    return TE.tryCatch(
      async () => {
        const id = GroupMemberId.check(value);
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
            // (gm) => GroupMember.check(gm)
            (gm) => gm
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * A helper function to make sure the sourceIds match
   */
  private matchSourceId(
    repoIdSource: GroupMemberSourceIdSource
  ): (matchIdSource: GroupMemberSourceIdSource) => boolean {
    return (matchIdSource: GroupMemberSourceIdSource) =>
      repoIdSource.id === matchIdSource.id &&
      repoIdSource.source === matchIdSource.source;
  }

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
        const idSource = prepareGroupMemberExternalIdSource(idSourceValue);
        const groupMember = this.groupMembers.find((cs) => {
          const matches = cs.sourceIds.filter(this.matchSourceId(idSource));
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
            // (gm) => GroupMember.check(gm)
            (gm) => gm
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Find by any value on the entity
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneByEntity = (
    groupMember: GroupMember
  ): TE.TaskEither<Error, GroupMember> => {
    return TE.tryCatch(
      async () => {
        const foundGroupMember = this.groupMembers.find(
          (gm) =>
            gm.email === groupMember.email && gm.groupId === groupMember.groupId
        );
        return pipe(
          foundGroupMember,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMember matching ${groupMember.email} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            // (gm) => GroupMember.check(gm)
            (gm) => gm
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  readonly findOneBy: Record<GroupMemberIdentifier, GroupMemberFindMethod> = {
    id: this.findOneById,
    idSourceValue: this.findOneByIdSourceValue,
    entity: this.findOneByEntity,
  };

  findOne = (identifier: GroupMemberIdentifier): GroupMemberFindMethod => {
    return this.findOneBy[identifier];
  };

  check = (groupMember: GroupMemberBase): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const group = this.groupMembers.find(
          (gm) =>
            gm.email === groupMember.email && gm.groupId === groupMember.groupId
        );
        return pipe(
          group,
          O.fromNullable,
          O.fold(
            () => false,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_) => true
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  save = (
    groupMember: GroupMember | GroupMemberBase
  ): TE.TaskEither<Error, GroupMember> => {
    return TE.tryCatch(
      async () => {
        // sneaky group addition
        // it's a fake repo, so we can do this
        const groupMemberToSave = {
          ...groupMember,
          group:
            'group' in groupMember
              ? groupMember.group
              : GroupBuilder().exists().buildBase(),
        };
        const groupExists = this.groupMembers.find(
          (cs) => cs.id === groupMember.id
        );
        if (groupExists) {
          this.groupMembers = this.groupMembers.map((cs) =>
            cs.id === groupMember.id ? groupMemberToSave : cs
          );
        } else {
          this.groupMembers.push(groupMemberToSave);
        }
        return groupMemberToSave;
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, GroupMember[]> => {
    return TE.right(this.groupMembers);
  };
}
