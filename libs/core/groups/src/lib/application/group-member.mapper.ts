import { GroupMember } from '../domain/entities/group-member';
import { GroupMemberSource } from '../domain/entities/group-member-source';
import config from '../static/config';

/**
 * TODO
 * - Should we do more checking of GroupMemberResponseDto?
 */
export class GroupMemberMapper {
  public static fromSourceToGroupMember(
    source: GroupMemberSource
  ): GroupMember {
    return GroupMember.check({
      id: source.id,
      status: source.status,
      memberId: source.memberId,
      groupId: source.groupId,
      memberName: source.memberName,
      memberEmail: source.memberEmail,
      memberOrganisationName: source.memberOrganisationName,
      accountOwner: config.defaults.accountOwner,
    });
  }
}
