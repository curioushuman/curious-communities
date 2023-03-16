import { DynamoDbMapper, memberSources } from '@curioushuman/common';
import { Member } from '../../../domain/entities/member';
import { MemberSourceIdSource } from '../../../domain/value-objects/member-source-id-source';
import config from '../../../static/config';
import { MembersDynamoDbItem } from './entities/item';
import {
  DynamoDbMemberAttributes,
  DynamoDbMemberKeys,
} from './entities/member';

export class DynamoDbMemberMapper {
  public static toDomain(item: MembersDynamoDbItem): Member {
    return Member.check({
      id: item.Member_Id,

      sourceOrigin: item.Member_Source_Origin,
      sourceIds: DynamoDbMapper.prepareDomainSourceIds<
        MembersDynamoDbItem,
        MemberSourceIdSource
      >(item, 'Member', memberSources),

      status: item.Member_Status,
      name: item.Member_Name,
      email: item.Member_Email,
      organisationName: item.Member_OrganisationName,

      accountOwner: item.AccountOwner,
    });
  }

  /**
   * Function to define the composite keys and the sort keys for other indexes
   *
   * NOTE: the fields Sk_{Index_Name} refer to the overloadable sortKey for the
   * index of that name. They can be populated by any other field value.
   *
   * TODO: later we could get fancier with this
   */
  public static toPersistenceKeys(member: Member): DynamoDbMemberKeys {
    const sourceIds =
      DynamoDbMapper.preparePersistenceSourceIds<MemberSourceIdSource>(
        member.sourceIds,
        'Member',
        config.defaults.accountSources,
        member.id
      );

    return DynamoDbMemberKeys.check({
      partitionKey: member.id,
      sortKey: member.id,
      Sk_Member_Email: member.id,
      ...sourceIds,
    });
  }

  /**
   * Function which focuses purely on the attributes
   */
  public static toPersistenceAttributes(
    member: Member
  ): DynamoDbMemberAttributes {
    const sourceIdFields =
      DynamoDbMapper.preparePersistenceSourceIdFields<MemberSourceIdSource>(
        member.sourceIds,
        'Member',
        config.defaults.accountSources
      );
    return {
      Member_Source_Origin: member.sourceOrigin,
      ...sourceIdFields,

      Member_Id: member.id,
      Member_Status: member.status,
      Member_Name: member.name,
      Member_Email: member.email,
      Member_OrganisationName: member.organisationName,

      AccountOwner: member.accountOwner,
    };
  }

  /**
   * Prepare Dynamodb record for saving
   *
   * NOTE: we're returning a DynamoDbItem here, not a DynamoDbMember.
   * The reason is that DynamoDb needs a complete record in place, this is
   * just how it works.
   */
  public static toPersistence(member: Member): MembersDynamoDbItem {
    const keys = DynamoDbMemberMapper.toPersistenceKeys(member);
    const attributes = DynamoDbMemberMapper.toPersistenceAttributes(member);
    return {
      ...keys,
      ...attributes,
    };
  }
}
