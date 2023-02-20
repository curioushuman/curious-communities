import { ExternalId } from '@curioushuman/common';
import { CreateGroupSourceDto } from '../../application/commands/create-group-source/create-group-source.dto';
import { UpdateGroupSourceDto } from '../../application/commands/update-group-source/update-group-source.dto';
import { FindGroupSourceDto } from '../../application/queries/find-group-source/find-group-source.dto';
import { GroupBase } from '../../domain/entities/group';

import {
  GroupSource,
  GroupSourceForCreate,
} from '../../domain/entities/group-source';
import {
  GroupSourceStatus,
  GroupSourceStatusEnum,
} from '../../domain/value-objects/group-source-status';
import { GroupBaseResponseDto } from '../../infra/dto/group-response.dto';
import { UpsertGroupSourceRequestDto } from '../../infra/upsert-group-source/dto/upsert-group-source.request.dto';
import config from '../../static/config';
import { GroupBuilder } from './group.builder';

/**
 * A builder for Group Sources to play with in testing.
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of Group
 * For the purpose of being able to create invalid Groups & DTOs and such
 */
type GroupSourceLooseMimic = {
  [K in keyof GroupSource]?: GroupSource[K] | string | number;
};

export const GroupSourceBuilder = () => {
  const source = config.defaults.primaryAccountSource;
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: GroupSourceLooseMimic = {
    id: '5008s1234519CjIPPU',
    source,
    status: GroupSourceStatusEnum.PENDING as GroupSourceStatus,
    name: 'Brown group',
    slug: 'brown-group',
  };
  const overrides: GroupSourceLooseMimic = {
    id: defaultProperties.id,
    source: defaultProperties.source,
    status: defaultProperties.status,
    name: defaultProperties.name,
    slug: defaultProperties.slug,
  };

  return {
    alpha() {
      overrides.id = '5000K1234567GEYQA3';
      overrides.name = 'Alpha group';
      return this;
    },

    beta() {
      overrides.id = '5008s000000y7LUAAY';
      overrides.name = 'Beta group';
      return this;
    },

    invalid() {
      overrides.id = '';
      return this;
    },

    invalidStatus() {
      overrides.name = 'Invalid group';
      overrides.status = 'this is invalid';
      return this;
    },

    exists() {
      overrides.id = ExternalId.check('ThisSourceExists');
      overrides.name = 'Exists group';
      return this;
    },

    updated() {
      overrides.id = ExternalId.check('ThisSourceUsedForUpdating');
      overrides.name = 'Exists group';
      overrides.status = 'active';
      return this;
    },

    existsAlpha() {
      overrides.id = ExternalId.check('ThisSourceExistsAlpha');
      overrides.name = 'Alpha Exists group';
      return this;
    },

    updatedAlpha() {
      overrides.id = ExternalId.check('ThisSourceUsedForUpdatingAlpha');
      overrides.name = 'Alpha Exists group';
      overrides.status = 'active';
      return this;
    },

    doesntExist() {
      overrides.id = ExternalId.check('NothingExistsHere');
      overrides.name = "I'm not here... Shhhh";
      return this;
    },

    build(): GroupSource {
      return this.buildNoCheck();
    },

    buildNoCheck(): GroupSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupSource;
    },

    buildForCreate(): GroupSourceForCreate {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupSourceForCreate;
    },

    buildFindByIdSourceValueGroupSourceDto(): FindGroupSourceDto {
      const build = this.buildNoCheck();
      return {
        identifier: 'idSource',
        value: {
          id: build.id,
          source,
        },
        source,
      } as FindGroupSourceDto;
    },

    buildFindByNameGroupSourceDto(): FindGroupSourceDto {
      const build = this.buildNoCheck();
      return {
        identifier: 'name',
        value: build.name,
        source,
      } as FindGroupSourceDto;
    },

    buildCreateUpsertGroupSourceRequestDto(
      g?: GroupBaseResponseDto
    ): UpsertGroupSourceRequestDto {
      const group =
        g || GroupBuilder().noSourceExists().buildGroupBaseResponseDto();
      return {
        source: config.defaults.primaryAccountSource,
        group,
      } as UpsertGroupSourceRequestDto;
    },

    buildCreateGroupSourceDto(g?: GroupBase): CreateGroupSourceDto {
      const group = g || GroupBuilder().noSourceExists().buildBase();
      return {
        source: config.defaults.primaryAccountSource,
        group,
      } as CreateGroupSourceDto;
    },

    buildUpdateUpsertGroupSourceRequestDto(
      g?: GroupBaseResponseDto
    ): UpsertGroupSourceRequestDto {
      const group = g || GroupBuilder().updated().buildGroupBaseResponseDto();
      return {
        source: config.defaults.primaryAccountSource,
        group,
      } as UpsertGroupSourceRequestDto;
    },

    buildUpdateGroupSourceDto(g?: GroupBase): UpdateGroupSourceDto {
      const group = g || GroupBuilder().updated().buildNoCheck();
      const groupSource = this.buildNoCheck();
      return {
        source: config.defaults.primaryAccountSource,
        group,
        groupSource,
      } as UpdateGroupSourceDto;
    },
  };
};
