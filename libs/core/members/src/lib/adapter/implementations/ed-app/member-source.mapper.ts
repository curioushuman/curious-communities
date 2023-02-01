import {
  EdAppApiAttributes,
  EdAppApiAttributesRuntype,
  EdAppApiRepository,
  confirmEnvVars,
} from '@curioushuman/common';

import {
  MemberSource,
  MemberSourceForCreate,
} from '../../../domain/entities/member-source';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import {
  EdAppApiMemberSource,
  EdAppApiMemberSourceForCreate,
} from './entities/member-source';

export class EdAppApiMemberSourceMapper {
  public static toDomain(
    sourceResponse: EdAppApiMemberSource,
    source: Source
  ): MemberSource {
    return MemberSource.check({
      id: sourceResponse.id,
      source,
      status: config.defaults.memberStatus,
      // ! NOT ideal...
      name: sourceResponse.email,
      email: sourceResponse.email,
      organisationName: sourceResponse.customFields?.organisationName,
    });
  }

  public static toSourceAttributes(
    domainEntity: MemberSource | MemberSourceForCreate
  ): EdAppApiAttributes<EdAppApiMemberSource> {
    const entity: EdAppApiAttributes<EdAppApiMemberSource> = {
      // name is actually username, which in our case is email
      name: domainEntity.email,
      email: domainEntity.email,
      customFields: {
        organisationName: domainEntity.organisationName,
      },
    };
    return EdAppApiAttributesRuntype(EdAppApiMemberSource).check(entity);
  }

  /**
   * It is here that we add in the necessary defaults
   */
  public static toSourceForCreate(
    domainEntity: MemberSourceForCreate
  ): EdAppApiMemberSourceForCreate {
    const requiredEnvVars = ['MEMBERS_DEFAULT_PASSWORD'];
    confirmEnvVars(requiredEnvVars);
    const entity = {
      ...EdAppApiMemberSourceMapper.toSourceAttributes(domainEntity),
      roles: EdAppApiRepository.defaults.roles,
      password: process.env.MEMBERS_DEFAULT_PASSWORD as string,
    };
    return EdAppApiMemberSourceForCreate.check(entity);
  }

  public static toSourceForUpdate(
    domainEntity: MemberSource
  ): EdAppApiMemberSource {
    const entity: EdAppApiAttributes<EdAppApiMemberSource> =
      EdAppApiMemberSourceMapper.toSourceAttributes(domainEntity);
    return EdAppApiMemberSource.check({
      id: domainEntity.id,
      ...entity,
    });
  }
}
