import {
  ParticipantSourceStatus,
  ParticipantSourceStatusEnum,
} from '../value-objects/participant-source-status';
import {
  ParticipantStatus,
  ParticipantStatusEnum,
} from '../value-objects/participant-status';

/**
 * Some common participant mapping functions
 */
export class ParticipantMapper {
  /**
   * Maps external to internal status
   */
  public static fromSourceStatus(
    status: ParticipantSourceStatus
  ): ParticipantStatus {
    const statusMap: Record<string, string> = {};
    statusMap[ParticipantSourceStatusEnum.REGISTERED] =
      ParticipantStatusEnum.PENDING;
    statusMap[ParticipantSourceStatusEnum.CANCELLED] =
      ParticipantStatusEnum.DISABLED;
    statusMap[ParticipantSourceStatusEnum.ATTENDED] =
      ParticipantStatusEnum.ACTIVE;
    // see if there is a mapping for this status
    if (Object.keys(statusMap).includes(status)) {
      return statusMap[status];
    }
    return status as ParticipantStatus;
  }
}
