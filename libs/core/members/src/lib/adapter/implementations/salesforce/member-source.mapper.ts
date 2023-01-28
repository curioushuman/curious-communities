import { MemberSource } from '../../../domain/entities/member-source';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import { SalesforceApiMemberSourceResponse } from './entities/member-source.response';

export class SalesforceApiMemberSourceMapper {
  public static toDomain(
    sourceResponse: SalesforceApiMemberSourceResponse,
    source: Source
  ): MemberSource {
    return MemberSource.check({
      id: sourceResponse.Id,
      source,
      status: config.defaults.memberStatus,
      name: sourceResponse.Full_name_custom__c,
      email: sourceResponse.Email,
      organisationName: sourceResponse.Organisation_name__c,
    });
  }
}
