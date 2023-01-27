import { MemberSource } from '../../../domain/entities/member-source';
import config from '../../../static/config';
import { SalesforceApiMemberSourceResponse } from './entities/member-source.response';

export class SalesforceApiMemberSourceMapper {
  public static toDomain(
    source: SalesforceApiMemberSourceResponse
  ): MemberSource {
    return MemberSource.check({
      id: source.Id,
      status: config.defaults.memberStatus,
      name: source.Full_name_custom__c,
      email: source.Email,
      organisationName: source.Organisation_name__c,
    });
  }
}
