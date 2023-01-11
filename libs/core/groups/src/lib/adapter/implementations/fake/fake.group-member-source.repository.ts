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
  GroupMemberSourceRepository,
} from '../../ports/group-member-source.repository';
import { GroupMemberSourceBuilder } from '../../../test/builders/group-member-source.builder';
import { GroupMemberSourceId } from '../../../domain/value-objects/group-member-source-id';
import { GroupMemberForSourceIdentify } from '../../../domain/entities/group-member';
import { Source } from '../../../domain/value-objects/source';
import { GroupSourceIdSource } from '../../../domain/value-objects/group-source-id-source';

@Injectable()
export class FakeGroupMemberSourceRepository
  implements GroupMemberSourceRepository
{
  private groupMemberSources: GroupMemberSource[] = [];

  readonly source: Source = 'GROUP';

  constructor() {
    this.groupMemberSources.push(GroupMemberSourceBuilder().exists().build());
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().existsAlpha().build()
    );
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().invalidSource().buildNoCheck()
    );
    this.groupMemberSources.push(GroupMemberSourceBuilder().alpha().build());
    this.groupMemberSources.push(GroupMemberSourceBuilder().beta().build());
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().invalidStatus().buildNoCheck()
    );
  }

  /**
   * Find by source ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneById = (
    value: GroupMemberSourceId
  ): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const id = GroupMemberSourceId.check(value);
        const groupMemberSource = this.groupMemberSources.find(
          (cs) => cs.id === id
        );
        return pipe(
          groupMemberSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMemberSource with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (gMS) => GroupMemberSource.check(gMS)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * A helper function for the helper function to make sure the groups match
   */
  private matchGroupIdSource(
    groupMemberSource: GroupMemberSource
  ): (idSource: GroupSourceIdSource) => boolean {
    return (groupMemberGroupIdSource) =>
      groupMemberGroupIdSource.id === groupMemberSource.groupId &&
      groupMemberGroupIdSource.source === this.source;
  }

  /**
   * A helper function to make sure the groups match
   */
  private matchGroup(
    groupMemberSource: GroupMemberSource,
    groupMember: GroupMemberForSourceIdentify
  ): boolean {
    const idSource = groupMember.group.sourceIds.find(
      this.matchGroupIdSource(groupMemberSource)
    );
    return !!idSource;
  }

  /**
   * Find by any value on the entity
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneByEntity = (
    groupMember: GroupMemberForSourceIdentify
  ): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const groupMemberSource = this.groupMemberSources.find(
          (gMS) =>
            gMS.email === groupMember.email && this.matchGroup(gMS, groupMember)
        );
        console.log('members', this.groupMemberSources);
        return pipe(
          groupMemberSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMemberSource matching ${groupMember.name} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (gMS) => GroupMemberSource.check(gMS)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  readonly findOneBy: Record<
    GroupMemberSourceIdentifier,
    GroupMemberSourceFindMethod
  > = {
    // NOTE: idSource is parsed to id in application layer
    idSource: this.findOneById,
    entity: this.findOneByEntity,
  };

  findOne = (
    identifier: GroupMemberSourceIdentifier
  ): GroupMemberSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  create = (
    groupMemberSource: GroupMemberSourceForCreate
  ): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const savedGroupMemberSource = {
          ...groupMemberSource,
          id: GroupMemberSourceId.check(`FakeId${Date.now()}`),
        };
        this.groupMemberSources.push(savedGroupMemberSource);
        return savedGroupMemberSource;
      },
      (reason: unknown) => reason as Error
    );
  };

  update = (
    groupMemberSource: GroupMemberSource
  ): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const groupMemberSourceExists = this.groupMemberSources.find(
          (cs) => cs.id === groupMemberSource.id
        );
        if (!groupMemberSourceExists) {
          throw new NotFoundException(
            `GroupMemberSource with id ${groupMemberSource.id} not found`
          );
        }
        this.groupMemberSources = this.groupMemberSources.map((cs) =>
          cs.id === groupMemberSource.id ? groupMemberSource : cs
        );
        return groupMemberSource;
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, GroupMemberSource[]> => {
    return TE.right(this.groupMemberSources);
  };
}
