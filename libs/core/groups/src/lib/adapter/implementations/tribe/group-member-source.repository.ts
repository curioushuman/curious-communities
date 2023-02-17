import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  SourceRepository,
  TribeApiRepositoryProps,
  TribeApiRepository,
  RestApiFindAllProps,
  RestApiFindAllResponse,
} from '@curioushuman/common';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import {
  GroupMemberSource,
  GroupMemberSourceForCreate,
  GroupMemberSourceIdentifier,
} from '../../../domain/entities/group-member-source';
import {
  GroupMemberSourceFindMethod,
  GroupMemberSourceRepositoryReadWrite,
} from '../../ports/group-member-source.repository';
import { TribeApiGroupMemberSourceForCreate } from './entities/group-member-source';
import { TribeApiGroupMemberSourceMapper } from './group-member-source.mapper';
import { Source } from '../../../domain/value-objects/source';
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
      sourceRuntype: TribeApiMemberSource,
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

  /**
   * Find all objects
   */
  findAll = (
    parentId: GroupSourceId,
    props?: RestApiFindAllProps
  ): TE.TaskEither<Error, RestApiFindAllResponse<GroupMemberSource>> => {
    return this.tribeApiRepository.tryFindAllChildren(
      parentId,
      this.processFindAll(this.SOURCE, parentId),
      this.tribeApiRepository.prepareFindAllProps(props)
    );
  };

  /**
   * Non-specific function to find one object from a list of all of them
   * Recursive to enable paged results returned from the repository
   */
  findOneFromAll = (
    parentId: GroupSourceId,
    field: keyof Pick<GroupMemberSource, 'memberId' | 'memberEmail'>,
    value: MemberSourceId | MemberEmail,
    page = 1
  ): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.tryCatch(
      async () => {
        const result = await executeTask(
          this.findAll(parentId, { page, limit: 100 })
        );
        const item = result.items.find((i) => i[field] === value);
        if (item) {
          return item;
        }
        if (result.next === false) {
          throw new RepositoryItemNotFoundError(
            `Group not found for ${field}: ${value}`
          );
        }
        return await executeTask(
          this.findOneFromAll(parentId, field, value, page + 1)
        );
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  findOneByMemberId = (props: {
    value: MemberSourceId;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    const memberId = MemberSourceId.check(props.value);
    return this.findOneFromAll(props.parentId, 'memberId', memberId);
  };

  findOneByMemberEmail = (props: {
    value: MemberEmail;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    const memberEmail = MemberEmail.check(props.value);
    return this.findOneFromAll(props.parentId, 'memberEmail', memberEmail);
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
