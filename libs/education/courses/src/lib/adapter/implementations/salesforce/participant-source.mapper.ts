import { ParticipantSource } from '../../../domain/entities/participant-source';
import { ParticipantSourceStatus } from '../../../domain/value-objects/participant-source-status';
import { Source } from '../../../domain/value-objects/source';
import { SalesforceApiParticipantSourceStatus } from './entities/participant-source-status';
import { SalesforceApiParticipantSourceResponse } from './entities/participant-source.response';

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
    sourceResponse: SalesforceApiParticipantSourceResponse,
    source: Source
  ): ParticipantSource {
    return ParticipantSource.check({
      id: sourceResponse.Id,
      source,
      courseId: sourceResponse.Case__c,
      status: SalesforceApiParticipantSourceMapper.toDomainStatus(
        sourceResponse.Status__c
      ),
      name: sourceResponse.Contact_full_name__c,
      email: sourceResponse.Contact_email__c,
      organisationName: sourceResponse.SYS_Organisation_name__c,
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
