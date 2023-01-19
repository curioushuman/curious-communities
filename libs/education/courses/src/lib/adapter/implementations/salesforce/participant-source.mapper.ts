import { ParticipantSource } from '../../../domain/entities/participant-source';
import { ParticipantSourceStatus } from '../../../domain/value-objects/participant-source-status';
import { SalesforceApiParticipantSourceStatus } from './types/participant-source-status';
import { SalesforceApiParticipantSourceResponse } from './types/participant-source.response';

export class SalesforceApiParticipantSourceMapper {
  /**
   * Note: responsibility for slug creation left to the create-participant.command
   *
   * TODO:
   * - [ ] remove status, we don't need it. Should be based on dateOpen and dateClosed
   * - [ ] add dateOpen and dateClosed
   *
   */
  public static toDomain(
    source: SalesforceApiParticipantSourceResponse
  ): ParticipantSource {
    return ParticipantSource.check({
      id: source.Id,
      courseId: source.Case__c,
      status: SalesforceApiParticipantSourceMapper.toDomainStatus(
        source.Status__c
      ),
      name: source.Contact_full_name__c,
      email: source.Contact_email__c,
      organisationName: source.SYS_Organisation_name__c,
    });
  }

  public static toDomainStatus(sourceStatus: string): ParticipantSourceStatus {
    if (!SalesforceApiParticipantSourceStatus.guard(sourceStatus)) {
      return 'unknown';
    }
    if (sourceStatus.indexOf('Attended')) {
      return 'attended';
    }
    const status = SalesforceApiParticipantSourceStatus.check(sourceStatus);
    const statusMap: Record<string, string> = {
      Pending: 'pending',
      Registered: 'registered',
      Cancelled: 'cancelled',
    };
    return ParticipantSourceStatus.check(statusMap[status]);
  }
}
