import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  confirmSourceId,
  SourceRepository,
  TribeApiRepositoryProps,
  TribeApiRepository,
  TribeApiSaveOneProcessMethod,
} from '@curioushuman/common';

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
import { GroupMemberSourceIdSource } from '../../../domain/value-objects/group-member-source-id-source';
import { GroupMemberSourceId } from '../../../domain/value-objects/group-member-source-id';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import { GroupMemberEmail } from '../../../domain/value-objects/group-member-email';

/**
 * Repository for GroupMemberSource at Tribe
 */
@Injectable()
export class TribeApiGroupMemberSourceRepository
  implements GroupMemberSourceRepositoryReadWrite, SourceRepository<Source>
{
  private tribeApiRepository: TribeApiRepository<
    GroupMemberSource,
    TribeApiGroupMemberSource,
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
    (item: TribeApiGroupMemberSource): GroupMemberSource => {
      // is it what we expected?
      // will throw error if not
      const groupItem = TribeApiGroupMemberSource.check(item);

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
    value: GroupMemberSourceId | GroupMemberEmail
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
   * - [ ] remove the type casting on the id
   */
  findOneByIdSource = (props: {
    value: GroupMemberSourceIdSource;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    // NOTE: this will throw an error if the value is invalid
    const id = confirmSourceId<GroupMemberSourceIdSource>(
      GroupMemberSourceIdSource.check(props.value),
      this.SOURCE
    );
    const parentId = GroupSourceId.check(props.parentId);
    return pipe(
      this.tribeApiRepository.tryFindAllChildren(
        parentId,
        this.processFindAll(this.SOURCE, parentId),
        { limit: 1000 }
      ),
      // NOTE: this shouldn't need a type cast...
      TE.chain(this.findOneChild('id', id as GroupMemberSourceId))
    );
  };

  /**
   * TODO
   * - [ ] support paging
   */
  findOneByEmail = (props: {
    value: GroupMemberEmail;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    const email = GroupMemberEmail.check(props.value);
    const parentId = GroupSourceId.check(props.parentId);
    return pipe(
      this.tribeApiRepository.tryFindAllChildren(
        parentId,
        this.processFindAll(this.SOURCE, parentId),
        { limit: 1000 }
      ),
      TE.chain(this.findOneChild('email', email))
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

  /**
   * This function is handed to the repository to process the response
   */
  processSaveOne =
    (
      source: Source,
      parentId: GroupSourceId
    ): TribeApiSaveOneProcessMethod<
      GroupMemberSource,
      TribeApiGroupMemberSource
    > =>
    (item) => {
      return TribeApiGroupMemberSourceMapper.toDomain(item, source, parentId);
    };

  /**
   * Create a record
   */
  create = (props: {
    groupMember: GroupMemberSourceForCreate;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    // NOTE: this will throw an error if the value is invalid
    const entity = TribeApiGroupMemberSourceMapper.toSourceForCreate(
      props.groupMember
    );
    return this.tribeApiRepository.tryCreateChild(
      props.parentId,
      entity,
      this.processSaveOne(this.SOURCE, props.parentId)
    );
  };

  /**
   * Update a record
   *
   * NOTE: there is no update for this repository
   */
  update = (props: {
    groupMember: GroupMemberSource;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, GroupMemberSource> => {
    return TE.right(props.groupMember);
  };

  /**
   * Delete a record
   */
  delete = (props: {
    groupMember: GroupMemberSource;
    parentId: GroupSourceId;
  }): TE.TaskEither<Error, void> => {
    return this.tribeApiRepository.tryDeleteChild(
      props.parentId,
      props.groupMember.id
    );
  };
}
