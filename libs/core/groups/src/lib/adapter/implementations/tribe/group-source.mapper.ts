import { TribeApiRepository, confirmEnvVars } from '@curioushuman/common';

import {
  GroupSource,
  GroupSourceForCreate,
} from '../../../domain/entities/group-source';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import {
  TribeApiGroupSource,
  TribeApiGroupSourceForCreate,
  TribeApiGroupSourceForUpdate,
} from './entities/group-source';

export class TribeApiGroupSourceMapper {
  /**
   * Mapping source to domain
   *
   * TODO:
   * - [ ] utilise the status from source
   *       at this point, we're unable to set it
   *       but, they could do it manually and we would need to follow suit
   */
  public static toDomain(
    sourceResponse: TribeApiGroupSource,
    source: Source
  ): GroupSource {
    return GroupSource.check({
      id: sourceResponse.id,
      source,
      status: config.defaults.groupStatus,
      name: sourceResponse.name,
      slug: sourceResponse.slug,
    });
  }

  /**
   * It is here that we add in the necessary defaults
   */
  public static toSourceForCreate(
    domainEntity: GroupSourceForCreate
  ): TribeApiGroupSourceForCreate {
    const requiredEnvVars = ['MEMBERS_DEFAULT_PASSWORD'];
    confirmEnvVars(requiredEnvVars);
    const entity = {
      name: domainEntity.name,
      slug: domainEntity.slug,
      privacy: TribeApiRepository.defaults.group.privacy,
      verified: TribeApiRepository.defaults.group.verified,
      registration: TribeApiRepository.defaults.group.registration,
    };
    return TribeApiGroupSourceForCreate.check(entity);
  }

  public static toSourceForUpdate(
    domainEntity: GroupSource
  ): TribeApiGroupSourceForUpdate {
    return TribeApiGroupSourceForUpdate.check({
      name: domainEntity.name,
      slug: domainEntity.slug,
    });
  }
}
