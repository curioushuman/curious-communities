import { ExternalId } from '@curioushuman/common';
import { CreateGroupSourceDto } from '../../application/commands/create-group-source/create-group-source.dto';
import { UpdateGroupSourceDto } from '../../application/commands/update-group-source/update-group-source.dto';
import { FindGroupSourceDto } from '../../application/queries/find-group-source/find-group-source.dto';

import { GroupSource } from '../../domain/entities/group-source';
import { GroupName } from '../../domain/value-objects/group-name';
import { GroupSourceStatus } from '../../domain/value-objects/group-source-status';
import { UpsertGroupSourceRequestDto } from '../../infra/upsert-group-source/dto/upsert-group-source.request.dto';
import config from '../../static/config';
import { GroupMemberBuilder } from './group-member.builder';
import { GroupBuilder } from './group.builder';

/**
 * A builder for Group Sources to play with in testing.
 */

/**
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
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
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: GroupSourceLooseMimic = {
    id: '5008s1234519CjIPPU',
    status: 'pending' as GroupSourceStatus,
    name: 'Brown group',
  };
  const overrides: GroupSourceLooseMimic = {
    id: defaultProperties.id,
    status: defaultProperties.status,
    name: defaultProperties.name,
  };

  let source = config.defaults.primaryAccountSource;

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

    alternateSource() {
      source = 'COMMUNITY';
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

    invalidSource() {
      overrides.name = '';
      return this;
    },

    exists() {
      overrides.id = ExternalId.check('ThisSourceExists');
      overrides.name = 'Exists group';
      return this;
    },

    updated() {
      overrides.id = ExternalId.check('ThisSourceExists');
      overrides.name = 'Exists group';
      overrides.status = 'open';
      return this;
    },

    existsAlpha() {
      overrides.id = ExternalId.check('ThisSourceExistsAlpha');
      overrides.name = 'Alpha Exists group';
      return this;
    },

    updatedAlpha() {
      overrides.id = ExternalId.check('ThisSourceExistsAlpha');
      overrides.name = 'Alpha Exists group';
      overrides.status = 'open';
      return this;
    },

    build(): GroupSource {
      return GroupSource.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): GroupSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupSource;
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

    // buildFindByIdSourceValueGroupSourceRequestDto(): FindByIdSourceValueGroupSourceRequestDto {
    //   const build = this.buildNoCheck();
    //   return {
    //     idSourceValue: prepareExternalIdSourceValue(build.id, source),
    //   } as FindByIdSourceValueGroupSourceRequestDto;
    // },

    buildCreateGroupSourceDto(): CreateGroupSourceDto {
      const group = GroupBuilder().noSourceExists().buildNoCheck();
      return {
        source: config.defaults.primaryAccountSource,
        group,
      } as CreateGroupSourceDto;
    },

    buildInvalidCreateGroupSourceDto(): CreateGroupSourceDto {
      const group = GroupBuilder().noSourceExists().buildNoCheck();
      group.name = '' as GroupName;
      return {
        source: config.defaults.primaryAccountSource,
        group,
      } as CreateGroupSourceDto;
    },

    buildUpdateGroupSourceDto(): UpdateGroupSourceDto {
      const group = GroupBuilder().updated().buildNoCheck();
      const groupSource = this.exists().buildNoCheck();
      return {
        source: config.defaults.primaryAccountSource,
        group,
        groupSource,
      } as UpdateGroupSourceDto;
    },

    buildInvalidUpdateGroupSourceDto(): UpdateGroupSourceDto {
      const group = GroupBuilder().exists().buildNoCheck();
      const groupSource = this.exists().buildNoCheck();
      group.name = '' as GroupName;
      return {
        source: config.defaults.primaryAccountSource,
        group,
        groupSource,
      } as UpdateGroupSourceDto;
    },

    buildCreateUpsertGroupSourceRequestDto(): UpsertGroupSourceRequestDto {
      const group = GroupBuilder().noSourceExists().buildGroupResponseDto();
      return {
        source: config.defaults.primaryAccountSource,
        group,
      } as UpsertGroupSourceRequestDto;
    },

    buildUpdateUpsertGroupSourceRequestDto(): UpsertGroupSourceRequestDto {
      const group = GroupBuilder().exists().buildGroupResponseDto();
      group.status = 'open';
      return {
        source: config.defaults.primaryAccountSource,
        group,
      } as UpsertGroupSourceRequestDto;
    },

    buildUpdateByEntityUpsertGroupSourceRequestDto(): UpsertGroupSourceRequestDto {
      const group = GroupBuilder().existsAlpha().buildGroupResponseDto();
      group.status = 'open';
      group.sourceIds = [];
      return {
        source: config.defaults.primaryAccountSource,
        group,
      } as UpsertGroupSourceRequestDto;
    },

    buildInvalidUpsertGroupSourceRequestDto(): UpsertGroupSourceRequestDto {
      const group = GroupBuilder().exists().buildGroupResponseDto();
      group.name = '' as GroupName;
      return {
        source: config.defaults.primaryAccountSource,
        group,
      } as UpsertGroupSourceRequestDto;
    },
  };
};
