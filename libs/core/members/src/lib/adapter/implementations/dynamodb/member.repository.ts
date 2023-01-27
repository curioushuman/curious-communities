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
  MemberFindMethod,
  MemberRepository,
} from '../../ports/member.repository';
import { Member, MemberIdentifier } from '../../../domain/entities/member';
import { DynamoDbMemberMapper } from './member.mapper';
import { MemberSourceIdSourceValue } from '../../../domain/value-objects/member-source-id-source';
import { DynamoDbMember } from './entities/member';
import { MembersItem } from './entities/item';
import { MemberId } from '../../../domain/value-objects/member-id';
import { MemberEmail } from '../../../domain/value-objects/member-email';

/**
 * A repository for members
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 * - we're using composition rather than inheritance here
 */
@Injectable()
export class DynamoDbMemberRepository implements MemberRepository {
  private dynamoDbRepository: DynamoDbRepository<Member, MembersItem>;

  constructor(private logger: LoggableLogger) {
    this.logger.setContext(DynamoDbMemberRepository.name);

    // set up the repository
    const props: DynamoDbRepositoryProps = {
      entityId: 'member',
      tableId: 'members',
      globalIndexIds: ['email', 'source-id-COURSE'],
      prefix: 'cc',
    };
    this.dynamoDbRepository = new DynamoDbRepository(props, this.logger);
  }

  processFindOne(
    item?: Record<string, unknown>,
    params?: DynamoDbFindOneParams
  ): Member {
    // did we find anything?
    if (!item) {
      throw new RepositoryItemNotFoundError(
        this.dynamoDbRepository.prepareErrorMessage('Member not found', params)
      );
    }

    // is it what we expected?
    // will throw error if not
    const memberItem = DynamoDbMember.check(item);

    // NOTE: if the response was invalid, an error would have been thrown
    // could this similarly be in a serialisation decorator?
    return DynamoDbMemberMapper.toDomain(memberItem);
  }

  findOneById = (value: MemberId): TE.TaskEither<Error, Member> => {
    const params = this.dynamoDbRepository.prepareParamsGet({
      primaryKey: value,
      sortKey: value,
    });
    return this.dynamoDbRepository.tryGetOne(params, this.processFindOne);
  };

  findOneByIdSourceValue = (
    value: MemberSourceIdSourceValue
  ): TE.TaskEither<Error, Member> => {
    // Set the parameters.
    const params = this.dynamoDbRepository.prepareParamsQueryOne({
      indexId: 'source-id-COURSE',
      value,
    });
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
  };

  findOneByEmail = (value: MemberEmail): TE.TaskEither<Error, Member> => {
    // Set the parameters.
    const params = this.dynamoDbRepository.prepareParamsQueryOne({
      indexId: 'email',
      value,
    });
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<MemberIdentifier, MemberFindMethod> = {
    idSourceValue: this.findOneByIdSourceValue,
    email: this.findOneByEmail,
    id: this.findOneById,
  };

  findOne = (identifier: MemberIdentifier): MemberFindMethod => {
    return this.findOneBy[identifier];
  };

  processSave(member: Member): (item?: Record<string, unknown>) => Member {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (_?: Record<string, unknown>) => {
      // I'm uncertain what particularly to do in here...
      // ? should we process the attributes?
      // const memberItem = DynamoDbMember.check(item);
      // return DynamoDbMemberMapper.toDomain(memberItem);

      // currently, if there were no errors per se
      // we're just returning the member as it was
      return member;
    };
  }

  /**
   * NOTE: we do not first find the member. This responsibility
   * is delegated to the service/application layer. If a record is
   * passed to this layer, it is with full knowledge of what is
   * going to happen. i.e. save, and save alone.
   */
  save = (member: Member): TE.TaskEither<Error, Member> => {
    const item = DynamoDbMemberMapper.toPersistence(member);
    const params = this.dynamoDbRepository.preparePutParams(item);
    return this.dynamoDbRepository.trySave(params, this.processSave(member));
  };
}
