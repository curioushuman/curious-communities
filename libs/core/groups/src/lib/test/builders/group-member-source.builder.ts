import { ExternalId } from '@curioushuman/common';
import { CreateGroupMemberSourceDto } from '../../application/commands/create-group-member-source/create-group-member-source.dto';
import { UpdateGroupMemberSourceDto } from '../../application/commands/update-group-member-source/update-group-member-source.dto';
import { FindGroupMemberSourceDto } from '../../application/queries/find-group-member-source/find-group-member-source.dto';
import { GroupMember } from '../../domain/entities/group-member';

import { GroupMemberSource } from '../../domain/entities/group-member-source';
import { GroupMemberSourceStatus } from '../../domain/value-objects/group-member-source-status';
import { GroupMemberResponseDto } from '../../infra/dto/group-member-response.dto';
import { GroupMemberSourceResponseDto } from '../../infra/dto/group-member-source.response.dto';
import { GroupMemberSourceMapper } from '../../infra/group-member-source.mapper';
import { UpsertGroupMemberSourceRequestDto } from '../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import config from '../../static/config';
import { GroupMemberBuilder } from './group-member.builder';
import { GroupSourceBuilder } from './group-source.builder';

/**
 * A builder for GroupMember Sources to play with in testing.
 */

/**
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of GroupMember
 * For the purpose of being able to create invalid GroupMembers & DTOs and such
 */
type GroupMemberSourceLooseMimic = {
  [K in keyof GroupMemberSource]?: GroupMemberSource[K] | string | number;
};

export const GroupMemberSourceBuilder = () => {
  const source = config.defaults.primaryAccountSource;

  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: GroupMemberSourceLooseMimic = {
    id: '5008s1234519CjIPPU',
    source,
    groupId: '5008s1234519CjIAAU',

    status: 'pending' as GroupMemberSourceStatus,
    name: 'James Brown',
    email: 'james@brown.com',
    organisationName: 'James Co',
  };
  const overrides: GroupMemberSourceLooseMimic = {
    id: defaultProperties.id,
    source: defaultProperties.source,
    groupId: defaultProperties.groupId,

    status: defaultProperties.status,
    name: defaultProperties.name,
    email: defaultProperties.email,
    organisationName: defaultProperties.organisationName,
  };

  return {
    alpha() {
      overrides.id = '5000K1234567GEYQA3';
      overrides.name = 'Jim Brown';
      return this;
    },

    beta() {
      overrides.id = '5008s000000y7LUAAY';
      overrides.name = 'June Brown';
      return this;
    },

    noMatchingSource() {
      return this;
    },

    invalid() {
      overrides.id = '';
      return this;
    },

    invalidStatus() {
      overrides.name = 'Jones Invalid';
      overrides.status = 'this is invalid' as GroupMemberSourceStatus;
      return this;
    },

    exists() {
      overrides.id = ExternalId.check('ThisSourceExists');
      return this;
    },

    updated() {
      overrides.id = ExternalId.check('ThisSourceUsedForUpdating');
      overrides.status = 'active' as GroupMemberSourceStatus;
      return this;
    },

    updatedAlpha() {
      overrides.id = ExternalId.check('ThisSourceUsedForUpdatingAlpha');
      overrides.status = 'active' as GroupMemberSourceStatus;
      return this;
    },

    doesntExist() {
      overrides.id = ExternalId.check('DoesntExist');
      overrides.email = 'doesnt@exist.com';
      return this;
    },

    build(): GroupMemberSource {
      return this.buildNoCheck();
    },

    buildNoCheck(): GroupMemberSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupMemberSource;
    },

    buildGroupMemberSourceResponseDto(): GroupMemberSourceResponseDto {
      const p = this.buildNoCheck();
      return GroupMemberSourceMapper.toResponseDto(p);
    },

    buildFindByIdSourceGroupMemberSourceDto(): FindGroupMemberSourceDto {
      const build = this.buildNoCheck();
      return {
        identifier: 'idSource',
        value: {
          id: build.id,
          source,
        },
        source,
        parentId: build.groupId,
      } as FindGroupMemberSourceDto;
    },

    buildFindByEmailGroupMemberSourceDto(): FindGroupMemberSourceDto {
      const build = this.buildNoCheck();
      return {
        identifier: 'email',
        value: build.email,
        source,
        parentId: build.groupId,
      } as FindGroupMemberSourceDto;
    },

    buildCreateUpsertGroupMemberSourceRequestDto(
      g?: GroupMemberResponseDto
    ): UpsertGroupMemberSourceRequestDto {
      const groupMember =
        g ||
        GroupMemberBuilder().noSourceExists().buildGroupMemberResponseDto();
      return {
        source: config.defaults.primaryAccountSource,
        groupMember,
      } as UpsertGroupMemberSourceRequestDto;
    },

    buildCreateGroupMemberSourceDto(
      g?: GroupMember
    ): CreateGroupMemberSourceDto {
      const groupMember = g || GroupMemberBuilder().noSourceExists().build();
      const groupSource = GroupSourceBuilder().exists().build();
      return {
        groupSource,
        groupMember,
      } as CreateGroupMemberSourceDto;
    },

    buildUpdateUpsertGroupMemberSourceRequestDto(
      g?: GroupMemberResponseDto
    ): UpsertGroupMemberSourceRequestDto {
      const groupMember =
        g || GroupMemberBuilder().updated().buildGroupMemberResponseDto();
      return {
        source: config.defaults.primaryAccountSource,
        groupMember,
      } as UpsertGroupMemberSourceRequestDto;
    },

    buildUpdateGroupMemberSourceDto(
      g?: GroupMember
    ): UpdateGroupMemberSourceDto {
      const groupMember = g || GroupMemberBuilder().updated().buildNoCheck();
      const groupMemberSource = this.buildNoCheck();
      return {
        source: config.defaults.primaryAccountSource,
        groupMember,
        groupMemberSource,
      } as UpdateGroupMemberSourceDto;
    },
  };
};
