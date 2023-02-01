import {
  Auth0ApiAttributes,
  Auth0ApiAttributesRuntype,
  Auth0ApiRepository,
  confirmEnvVars,
} from '@curioushuman/common';

import {
  MemberSource,
  MemberSourceForCreate,
} from '../../../domain/entities/member-source';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import {
  Auth0ApiMemberSource,
  Auth0ApiMemberSourceForCreate,
} from './entities/member-source';

export class Auth0ApiMemberSourceMapper {
  public static toDomain(
    sourceResponse: Auth0ApiMemberSource,
    source: Source
  ): MemberSource {
    return MemberSource.check({
      id: sourceResponse.user_id,
      source,
      status: config.defaults.memberStatus,
      name: sourceResponse.name,
      email: sourceResponse.email,
      organisationName: sourceResponse.user_metadata?.organisation_name,
    });
  }

  public static toSourceAttributes(
    domainEntity: MemberSource | MemberSourceForCreate
  ): Auth0ApiAttributes<Auth0ApiMemberSource> {
    const entity: Auth0ApiAttributes<Auth0ApiMemberSource> = {
      name: domainEntity.name,
      email: domainEntity.email,
      user_metadata: {
        organisation_name: domainEntity.organisationName,
      },
    };
    return Auth0ApiAttributesRuntype(Auth0ApiMemberSource).check(entity);
  }

  /**
   * It is here that we add in the necessary defaults
   */
  public static toSourceForCreate(
    domainEntity: MemberSourceForCreate
  ): Auth0ApiMemberSourceForCreate {
    const requiredEnvVars = ['AUTH0_DEFAULT_PASSWORD'];
    confirmEnvVars(requiredEnvVars);
    const entity = {
      ...Auth0ApiMemberSourceMapper.toSourceAttributes(domainEntity),
      connection: Auth0ApiRepository.defaults.connection,
      password: process.env.AUTH0_DEFAULT_PASSWORD as string,
    };
    return Auth0ApiMemberSourceForCreate.check(entity);
  }

  public static toSourceForUpdate(
    domainEntity: MemberSource
  ): Auth0ApiMemberSource {
    const entity: Auth0ApiAttributes<Auth0ApiMemberSource> =
      Auth0ApiMemberSourceMapper.toSourceAttributes(domainEntity);
    return Auth0ApiMemberSource.check({
      Id: domainEntity.id,
      ...entity,
    });
  }
}
