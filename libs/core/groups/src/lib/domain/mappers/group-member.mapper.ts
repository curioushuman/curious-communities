import {
  GroupMemberStatus,
  GroupMemberStatusEnum,
} from '../value-objects/group-member-status';

/**
 * Some common group mapping functions
 */
export class GroupMemberMapper {
  /**
   * Map from participant status to group status
   */
  public static fromParticipantStatus(status: string): GroupMemberStatus {
    // see if we have a status that aligns
    let commonStatus = Object.values(GroupMemberStatusEnum).find(
      (gmStatus) => gmStatus === status
    );
    if (!commonStatus) {
      commonStatus = GroupMemberStatusEnum.UNKNOWN;
    }
    return GroupMemberStatus.check(commonStatus);
  }
}
