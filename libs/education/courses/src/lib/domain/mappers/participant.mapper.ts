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
   * Currently doesn't do anything as they align.
   * But if they ever diverge, this is where you'd do it
   */
  public static fromSourceStatus(
    status: ParticipantSourceStatus
  ): ParticipantStatus {
    const statusMap: Record<string, string> = {};
    statusMap[ParticipantSourceStatusEnum.REGISTERED] =
      ParticipantStatusEnum.PENDING;
    statusMap[ParticipantSourceStatusEnum.CANCELLED] =
      ParticipantStatusEnum.DISABLED;
    // see if there is a mapping for this status
    if (Object.keys(statusMap).includes(status)) {
      return statusMap[status];
    }
    return status as ParticipantStatus;
  }
}
