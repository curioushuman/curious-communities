import {
  SalesforceApiAttributes,
  SalesforceApiAttributesRuntype,
} from '@curioushuman/common';
import {
  MemberSource,
  MemberSourceForCreate,
} from '../../../domain/entities/member-source';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import { SalesforceApiMemberSource } from './entities/member-source';

export class SalesforceApiMemberSourceMapper {
  public static toDomain(
    sourceResponse: SalesforceApiMemberSource,
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

  public static toSourceAttributes(
    domainEntity: MemberSource | MemberSourceForCreate
  ): SalesforceApiAttributes<SalesforceApiMemberSource> {
    const entity: SalesforceApiAttributes<SalesforceApiMemberSource> = {
      Full_name_custom__c: domainEntity.name,
      Email: domainEntity.email,
      Organisation_name__c: domainEntity.organisationName,
    };
    return SalesforceApiAttributesRuntype(SalesforceApiMemberSource).check(
      entity
    );
  }

  public static toSourceForCreate(
    domainEntity: MemberSourceForCreate
  ): SalesforceApiAttributes<SalesforceApiMemberSource> {
    return SalesforceApiMemberSourceMapper.toSourceAttributes(domainEntity);
  }

  public static toSourceForUpdate(
    domainEntity: MemberSource
  ): SalesforceApiMemberSource {
    const entity: SalesforceApiAttributes<SalesforceApiMemberSource> =
      SalesforceApiMemberSourceMapper.toSourceAttributes(domainEntity);
    return SalesforceApiMemberSource.check({
      Id: domainEntity.id,
      ...entity,
    });
  }
}
