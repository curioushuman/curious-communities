import { DynamoDbMapper, memberSources } from '@curioushuman/common';
import { Member } from '../../../domain/entities/member';
import { MemberSourceIdSource } from '../../../domain/value-objects/member-source-id-source';
import { GroupsDynamoDbItem } from './entities/item';
import { DynamoDbMemberAttributes } from './entities/member';

export class DynamoDbMemberMapper {
  /**
   * Converts the DynamoDb item to a domain entity
   */
  public static toDomain(item: GroupsDynamoDbItem): Member {
    return Member.check({
      // IMPORTANT: pk and sk are not part of this entity
      id: item.Member_Id,

      // other ids
      sourceOrigin: item.Member_Source_Origin,
      sourceIds: DynamoDbMapper.prepareDomainSourceIds<
        GroupsDynamoDbItem,
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
   * Function which focuses purely on the attributes
   */
  public static toPersistenceAttributes(
    member: Member
  ): DynamoDbMemberAttributes {
    const sourceIdFields =
      DynamoDbMapper.preparePersistenceSourceIdFields<MemberSourceIdSource>(
        member.sourceIds,
        'Member',
        memberSources
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
}
