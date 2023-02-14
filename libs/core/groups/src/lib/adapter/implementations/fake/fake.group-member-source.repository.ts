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
import { GroupMemberSourceId } from '../../../domain/value-objects/group-member-source-id';
import config from '../../../static/config';
import { Source } from '../../../domain/value-objects/source';
import { GroupMemberSourceIdSource } from '../../../domain/value-objects/group-member-source-id-source';
import { GroupMemberEmail } from '../../../domain/value-objects/group-member-email';
import { GroupMemberName } from '../../../domain/value-objects/group-member-name';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';

@Injectable()
export class FakeGroupMemberSourceRepository
  implements GroupMemberSourceRepositoryReadWrite
{
  private groupMemberSources: GroupMemberSource[] = [];

  private renameGroupMember(groupMember: GroupMemberSource): GroupMemberSource {
    groupMember.name = 'Bland base name' as GroupMemberName;
    return groupMember;
  }

  constructor() {
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().exists().buildNoCheck()
    );
    this.groupMemberSources.push(
      this.renameGroupMember(
        GroupMemberSourceBuilder().updated().buildNoCheck()
      )
    );
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().invalid().buildNoCheck()
    );
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().alpha().buildNoCheck()
    );
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().beta().buildNoCheck()
    );
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().invalidStatus().buildNoCheck()
    );
  }

  /**
   * Find by source ID
   */
  findOneByIdSource = (props: {
    value: GroupMemberSourceIdSource;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const idSource = GroupMemberSourceIdSource.check(props.value);
        const groupId = GroupSourceId.check(props.parentId);
        const groupSource = this.groupMemberSources.find(
          (cs) => cs.id === idSource.id && cs.groupId === groupId
        );
        return pipe(
          groupSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMemberSource with id ${idSource.id} not found`
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
  findOneByEmail = (props: {
    value: GroupMemberEmail;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const email = GroupMemberEmail.check(props.value);
        const groupId = GroupSourceId.check(props.parentId);
        const groupSource = this.groupMemberSources.find(
          (cs) => cs.email === email && cs.groupId === groupId
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
      idSource: this.findOneByIdSource,
      email: this.findOneByEmail,
    };

  findOne = (
    identifier: GroupMemberSourceIdentifier
  ): GroupMemberSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  create = (props: {
    groupMember: GroupMemberSourceForCreate;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const savedGroupMemberSource = {
          ...props.groupMember,
          groupId: props.parentId,
          source: config.defaults.primaryAccountSource as Source,
          id: GroupMemberSourceId.check(`FakeId${Date.now()}`),
        };
        this.groupMemberSources.push(savedGroupMemberSource);
        return savedGroupMemberSource;
      },
      (reason: unknown) => reason as Error
    );
  };

  update = (props: {
    groupMember: GroupMemberSource;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const groupMemberSourceExists = this.groupMemberSources.find(
          (cs) => cs.id === props.groupMember.id
        );
        if (!groupMemberSourceExists) {
          throw new NotFoundException(
            `GroupMemberSource with id ${props.groupMember.id} not found`
          );
        }
        this.groupMemberSources = this.groupMemberSources.map((cs) =>
          cs.id === props.groupMember.id ? props.groupMember : cs
        );
        return groupMemberSourceExists;
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, GroupMemberSource[]> => {
    return TE.right(this.groupMemberSources);
  };
}
