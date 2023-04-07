import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  SourceRepository,
  EdAppApiRepositoryProps,
  EdAppApiRepository,
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
import { EdAppApiGroupMemberSourceForCreate } from './entities/group-member-source';
import { EdAppApiGroupMemberSourceMapper } from './group-member-source.mapper';
import { Source } from '../../../domain/value-objects/source';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { EdAppApiMemberSource } from './entities/member-source';

/**
 * Repository for GroupMemberSource at EdApp
 */
@Injectable()
export class EdAppApiGroupMemberSourceRepository
  implements GroupMemberSourceRepositoryReadWrite, SourceRepository<Source>
{
  private edAppApiRepository: EdAppApiRepository<
    GroupMemberSource,
    EdAppApiMemberSource,
    EdAppApiGroupMemberSourceForCreate
  >;

  /**
   * The key for this source
   */
  public readonly SOURCE = 'MICRO-COURSE';

  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    this.logger.setContext(EdAppApiGroupMemberSourceRepository.name);

    // set up the repository
    const props: EdAppApiRepositoryProps = {
      sourceName: 'users',
      sourceRuntype: EdAppApiMemberSource,
      parentSourceName: 'usergroups',
    };
    this.edAppApiRepository = new EdAppApiRepository(
      props,
      this.httpService,
      this.logger
    );
  }

  processFindAll =
    (source: Source, parentId: GroupSourceId) =>
    (item: EdAppApiMemberSource): GroupMemberSource => {
      // is it what we expected?
      // will throw error if not
      const groupItem = EdAppApiMemberSource.check(item);

      // NOTE: if the response was invalid, an error would have been thrown
      // could this similarly be in a serialisation decorator?
      return EdAppApiGroupMemberSourceMapper.toDomain(
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
    return this.edAppApiRepository.tryFindAllChildren(
      parentId,
      this.processFindAll(this.SOURCE, parentId),
      this.edAppApiRepository.prepareFindAllProps(props)
    );
  };

  /**
   * Non-specific function to find one object from a list of all of them
   * recursive to enable paged results returned from the repository
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
      EdAppApiGroupMemberSourceMapper.toSourceForCreate(groupMember);
    return pipe(
      this.edAppApiRepository.tryCreateChild(groupMember.groupId, entity),
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
    return this.edAppApiRepository.tryDeleteChild(
      groupMember.groupId,
      groupMember.memberId
    );
  };
}
