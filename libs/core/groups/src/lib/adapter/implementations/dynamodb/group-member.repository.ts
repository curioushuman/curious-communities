import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import {
  DynamoDbFindOneParams,
  DynamoDbRepository,
  DynamoDbRepositoryProps,
} from '@curioushuman/common';

import {
  GroupMemberFindMethod,
  GroupMemberRepository,
} from '../../ports/group-member.repository';
import {
  GroupMember,
  GroupMemberIdentifier,
} from '../../../domain/entities/group-member';
import { DynamoDbGroupMemberMapper } from './group-member.mapper';
import { DynamoDbGroupMember } from './entities/group-member';
import { GroupsItem } from './entities/item';
import { ParticipantId } from '../../../domain/value-objects/participant-id';
import { MemberId } from '../../../domain/value-objects/member-id';
import { GroupId } from '../../../domain/value-objects/group-id';

/**
 * A repository for groupMembers
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 * - we're using composition rather than inheritance here
 */
@Injectable()
export class DynamoDbGroupMemberRepository implements GroupMemberRepository {
  private dynamoDbRepository: DynamoDbRepository<GroupMember, GroupsItem>;

  constructor(private logger: LoggableLogger) {
    this.logger.setContext(DynamoDbGroupMemberRepository.name);

    // set up the repository
    const props: DynamoDbRepositoryProps = {
      entityId: 'groupMember',
      tableId: 'groupMembers',
      globalIndexIds: ['source-id-COURSE'],
      localIndexIds: ['last-name'],
      prefix: 'cc',
    };
    this.dynamoDbRepository = new DynamoDbRepository(props, this.logger);
  }

  processFindOne(
    item?: Record<string, unknown>,
    params?: DynamoDbFindOneParams
  ): GroupMember {
    // did we find anything?
    if (!item) {
      throw new RepositoryItemNotFoundError(
        DynamoDbRepository.prepareErrorMessage('GroupMember not found', params)
      );
    }

    // is it what we expected?
    // will throw error if not
    const groupMemberItem = DynamoDbGroupMember.check(item);

    // NOTE: if the response was invalid, an error would have been thrown
    // could this similarly be in a serialisation decorator?
    return DynamoDbGroupMemberMapper.toDomain(groupMemberItem);
  }

  /**
   * ! UPDATE: removed until we figure out the best way to do this
   */
  // findOneById = (value: GroupMemberId): TE.TaskEither<Error, GroupMember> => {
  //   const params = this.dynamoDbRepository.prepareParamsGet({
  //     primaryKey: value,
  //     sortKey: value,
  //   });
  //   return this.dynamoDbRepository.tryGetOne(params, this.processFindOne);
  // };

  findOneByMemberId = (props: {
    value: MemberId;
    parentId: GroupId;
  }): TE.TaskEither<Error, GroupMember> => {
    // Set the parameters.
    const params = this.dynamoDbRepository.prepareParamsQueryOne({
      indexId: `member-id`,
      value: props.value,
    });
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
  };

  findOneByParticipantId = (props: {
    value: ParticipantId;
    parentId: GroupId;
  }): TE.TaskEither<Error, GroupMember> => {
    // Set the parameters.
    const params = this.dynamoDbRepository.prepareParamsQueryOne({
      indexId: `participant-id`,
      value: props.value,
    });
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<GroupMemberIdentifier, GroupMemberFindMethod> = {
    memberId: this.findOneByMemberId,
    participantId: this.findOneByParticipantId,
  };

  findOne = (identifier: GroupMemberIdentifier): GroupMemberFindMethod => {
    return this.findOneBy[identifier];
  };

  processSave(
    groupMember: GroupMember
  ): (item?: Record<string, unknown>) => GroupMember {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (_?: Record<string, unknown>) => {
      // I'm uncertain what particularly to do in here...
      // ? should we process the attributes?
      // const groupMemberItem = DynamoDbGroupMember.check(item);
      // return DynamoDbGroupMemberMapper.toDomain(groupMemberItem);

      // currently, if there were no errors per se
      // we're just returning the groupMember as it was
      return groupMember;
    };
  }

  /**
   * NOTE: we do not first find the groupMember. This responsibility
   * is delegated to the service/application layer. If a record is
   * passed to this layer, it is with full knowledge of what is
   * going to happen. i.e. save, and save alone.
   */
  save = (groupMember: GroupMember): TE.TaskEither<Error, GroupMember> => {
    const item = DynamoDbGroupMemberMapper.toPersistence(groupMember);
    const params = this.dynamoDbRepository.preparePutParams(item);
    return this.dynamoDbRepository.trySave(
      params,
      this.processSave(groupMember)
    );
  };
}
