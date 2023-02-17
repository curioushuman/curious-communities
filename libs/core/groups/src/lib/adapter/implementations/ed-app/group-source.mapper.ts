import {
  GroupSource,
  GroupSourceForCreate,
} from '../../../domain/entities/group-source';
import { createGroupSlug } from '../../../domain/value-objects/group-slug';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import {
  EdAppApiGroupSource,
  EdAppApiGroupSourceForCreate,
  EdAppApiGroupSourceForUpdate,
} from './entities/group-source';

export class EdAppApiGroupSourceMapper {
  /**
   * Mapping source to domain
   */
  public static toDomain(
    sourceResponse: EdAppApiGroupSource,
    source: Source
  ): GroupSource {
    return GroupSource.check({
      id: sourceResponse.id,
      source,
      status: config.defaults.groupStatus,
      name: sourceResponse.name,
      // ! NOT IDEAL
      // We're currently not persisting from this source so...
      slug: createGroupSlug(sourceResponse.name),
    });
  }

  /**
   * It is here that we add in the necessary defaults
   */
  public static toSourceForCreate(
    domainEntity: GroupSourceForCreate
  ): EdAppApiGroupSourceForCreate {
    const entity = {
      name: domainEntity.name,
    };
    return EdAppApiGroupSourceForCreate.check(entity);
  }

  public static toSourceForUpdate(
    domainEntity: GroupSource
  ): EdAppApiGroupSourceForUpdate {
    const entity = {
      name: domainEntity.name,
    };
    return EdAppApiGroupSourceForUpdate.check(entity);
  }
}
