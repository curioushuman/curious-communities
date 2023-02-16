import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  SourceRepository,
  TribeApiRepositoryProps,
  TribeApiRepository,
} from '@curioushuman/common';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';

import {
  GroupMemberSource,
  GroupMemberSourceForCreate,
  GroupMemberSourceIdentifier,
} from '../../../domain/entities/group-member-source';
import {
  GroupMemberSourceFindMethod,
  GroupMemberSourceRepositoryReadWrite,
} from '../../ports/group-member-source.repository';
import {
  TribeApiGroupMemberSource,
  TribeApiGroupMemberSourceForCreate,
} from './entities/group-member-source';
import { TribeApiGroupMemberSourceMapper } from './group-member-source.mapper';
import { Source } from '../../../domain/value-objects/source';
import { GroupMemberSourceId } from '../../../domain/value-objects/group-member-source-id';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { TribeApiMemberSource } from './entities/member-source';

/**
 * Repository for GroupMemberSource at Tribe
 */
@Injectable()
export class TribeApiGroupMemberSourceRepository
  implements GroupMemberSourceRepositoryReadWrite, SourceRepository<Source>
{
  private tribeApiRepository: TribeApiRepository<
    GroupMemberSource,
    TribeApiMemberSource,
    TribeApiGroupMemberSourceForCreate
  >;

  /**
   * The key for this source
   */
  public readonly SOURCE = 'COMMUNITY';

  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    this.logger.setContext(TribeApiGroupMemberSourceRepository.name);

    // set up the repository
    const props: TribeApiRepositoryProps = {
      sourceName: 'members',
      sourceRuntype: TribeApiGroupMemberSource,
      parentSourceName: 'groups',
    };
    this.tribeApiRepository = new TribeApiRepository(
      props,
      this.httpService,
      this.logger
    );
  }

  processFindAll =
    (source: Source, parentId: GroupSourceId) =>
    (item: TribeApiMemberSource): GroupMemberSource => {
      // is it what we expected?
      // will throw error if not
      const groupItem = TribeApiMemberSource.check(item);

      // NOTE: if the response was invalid, an error would have been thrown
      // could this similarly be in a serialisation decorator?
      return TribeApiGroupMemberSourceMapper.toDomain(
        groupItem,
        source,
        parentId
      );
    };

  private findOneChild(
    field: keyof GroupMemberSource,
    value: GroupMemberSourceId | MemberEmail
  ): (
    children: GroupMemberSource[]
  ) => TE.TaskEither<Error, GroupMemberSource> {
    return (children: GroupMemberSource[]) => {
      const member = children.find((c) => c[field] === value);
      if (!member) {
        return TE.left(
          new RepositoryItemNotFoundError(
            `GroupMember not found for identifier: ${value}`
          )
        );
      }
      return TE.right(member);
    };
  }

  /**
   * TODO
   * - [ ] support paging
   */
  findOneByMemberId = (props: {
    value: MemberSourceId;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    const memberId = MemberSourceId.check(props.value);
    const parentId = GroupSourceId.check(props.parentId);
    return pipe(
      this.tribeApiRepository.tryFindAllChildren(
        parentId,
        this.processFindAll(this.SOURCE, parentId),
        { limit: 1000 }
      ),
      TE.chain(this.findOneChild('memberId', memberId))
    );
  };

  /**
   * TODO
   * - [ ] support paging
   */
  findOneByMemberEmail = (props: {
    value: MemberEmail;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    const memberEmail = MemberEmail.check(props.value);
    const parentId = GroupSourceId.check(props.parentId);
    return pipe(
      this.tribeApiRepository.tryFindAllChildren(
        parentId,
        this.processFindAll(this.SOURCE, parentId),
        { limit: 1000 }
      ),
      TE.chain(this.findOneChild('memberEmail', memberEmail))
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

  /**
   * Create a record
   *
   * NOTE: tryCreateChild returns void
   */
  create = (
    groupMember: GroupMemberSourceForCreate
  ): TE.TaskEither<Error, GroupMemberSource> => {
    // NOTE: this will throw an error if the value is invalid
    const entity =
      TribeApiGroupMemberSourceMapper.toSourceForCreate(groupMember);
    return pipe(
      this.tribeApiRepository.tryCreateChild(groupMember.groupId, entity),
      TE.chain(() => TE.right(groupMember))
    );
  };

  /**
   * Update a record
   *
   * NOTE: there is no update for this repository for this object
   */
  update = (
    groupMember: GroupMemberSource
  ): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.right(groupMember);
  };

  /**
   * Delete a record
   */
  delete = (groupMember: GroupMemberSource): TE.TaskEither<Error, void> => {
    return this.tribeApiRepository.tryDeleteChild(
      groupMember.groupId,
      groupMember.memberId
    );
  };
}
