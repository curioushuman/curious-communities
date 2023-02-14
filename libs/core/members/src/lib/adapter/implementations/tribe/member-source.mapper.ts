import { TribeApiRepository, confirmEnvVars } from '@curioushuman/common';

import {
  MemberSource,
  MemberSourceForCreate,
} from '../../../domain/entities/member-source';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import {
  TribeApiMemberSource,
  TribeApiMemberSourceForCreate,
  TribeApiMemberSourceForUpdate,
} from './entities/member-source';

export class TribeApiMemberSourceMapper {
  public static toDomain(
    sourceResponse: TribeApiMemberSource,
    source: Source
  ): MemberSource {
    return MemberSource.check({
      id: sourceResponse.id,
      source,
      status: config.defaults.memberStatus,
      name: sourceResponse.profile.name,
      email: sourceResponse.email,
      organisationName: 'Not provided',
    });
  }

  /**
   * It is here that we add in the necessary defaults
   */
  public static toSourceForCreate(
    domainEntity: MemberSourceForCreate
  ): TribeApiMemberSourceForCreate {
    const requiredEnvVars = ['MEMBERS_DEFAULT_PASSWORD'];
    confirmEnvVars(requiredEnvVars);
    const entity = {
      name: domainEntity.name,
      email: domainEntity.email,
      password: process.env.MEMBERS_DEFAULT_PASSWORD as string,
      role: TribeApiRepository.defaults.user.role,
      source: TribeApiRepository.defaults.user.source,
    };
    return TribeApiMemberSourceForCreate.check(entity);
  }

  public static toSourceForUpdate(
    domainEntity: MemberSource
  ): TribeApiMemberSourceForUpdate {
    return TribeApiMemberSourceForUpdate.check({
      name: domainEntity.name,
      email: domainEntity.email,
    });
  }
}
