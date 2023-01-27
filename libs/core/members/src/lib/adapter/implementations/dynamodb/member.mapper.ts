import { findSourceIdAsValue } from '@curioushuman/common';
import {
  Member,
  prepareMemberExternalIdSource,
} from '../../../domain/entities/member';
import { MemberSourceIdSource } from '../../../domain/value-objects/member-source-id-source';
import config from '../../../static/config';
import { MembersDynamoDbItem } from './entities/item';
import {
  DynamoDbMemberAttributes,
  DynamoDbMemberKeys,
} from './entities/member';

export class DynamoDbMemberMapper {
  public static toDomain(item: MembersDynamoDbItem): Member {
    const sourceId = item.Member_SourceIdCOURSE
      ? prepareMemberExternalIdSource(item.Member_SourceIdCOURSE)
      : undefined;
    return Member.check({
      id: item.primaryKey,

      sourceIds: sourceId ? [sourceId] : [],

      status: item.Member_Status,
      name: item.Member_Name,
      email: item.Member_Email,
      organisationName: item.Member_OrganisationName,

      accountOwner: item.AccountOwner,
    });
  }

  /**
   * Function to define the composite keys
   *
   * TODO: later we could get fancier with this
   */
  public static toPersistenceKeys(member: Member): DynamoDbMemberKeys {
    const sourceIdValue = findSourceIdAsValue<MemberSourceIdSource>(
      member.sourceIds,
      config.defaults.primaryAccountSource
    );
    return DynamoDbMemberKeys.check({
      primaryKey: member.id,
      // sortKey: member.lastName,

      Sk_Member_Email: member.email,
      Sk_Member_SourceIdCOURSE: sourceIdValue,
    });
  }

  /**
   * Function which focuses purely on the attributes
   */
  public static toPersistenceAttributes(
    member: Member
  ): DynamoDbMemberAttributes {
    const sourceIdValue = findSourceIdAsValue<MemberSourceIdSource>(
      member.sourceIds,
      config.defaults.primaryAccountSource
    );
    return {
      Member_SourceIdCOURSE: sourceIdValue,

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
