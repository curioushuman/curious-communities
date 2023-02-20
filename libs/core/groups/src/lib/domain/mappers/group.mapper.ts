import { GroupStatus, GroupStatusEnum } from '../value-objects/group-status';

/**
 * Some common group mapping functions
 */
export class GroupMapper {
  /**
   * Map from course status to group status
   */
  public static fromCourseStatus(status: string): GroupStatus {
    // see if we have a status that aligns
    const commonStatus = Object.values(GroupStatusEnum).find(
      (gStatus) => gStatus === status
    );
    if (commonStatus) {
      return commonStatus as GroupStatus;
    }
    return GroupStatusEnum.UNKNOWN;
  }
}
