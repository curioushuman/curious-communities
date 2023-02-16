import { CreateGroupMemberSourceDto } from '../../application/commands/create-group-member-source/create-group-member-source.dto';
import { UpdateGroupMemberSourceDto } from '../../application/commands/update-group-member-source/update-group-member-source.dto';
import { FindGroupMemberSourceDto } from '../../application/queries/find-group-member-source/find-group-member-source.dto';
import { GroupMember } from '../../domain/entities/group-member';

import { GroupMemberSource } from '../../domain/entities/group-member-source';
import { GroupMemberSourceStatus } from '../../domain/value-objects/group-member-source-status';
import { GroupMemberResponseDto } from '../../infra/dto/group-member-response.dto';
import { GroupMemberSourceResponseDto } from '../../infra/dto/group-member-source.response.dto';
import { UpsertGroupMemberSourceRequestDto } from '../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import config from '../../static/config';
import { GroupMemberBuilder } from './group-member.builder';
import { GroupSourceBuilder } from './group-source.builder';
import { MemberBuilder } from './member.builder';

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
    source,
    groupId: '5008s1234519CjIAAU',
    memberId: '5008s1234519CjIBB2',
    memberEmail: 'james@brown.com',
    status: 'pending' as GroupMemberSourceStatus,
  };
  const overrides: GroupMemberSourceLooseMimic = {
    source: defaultProperties.source,
    groupId: defaultProperties.groupId,
    memberId: defaultProperties.memberId,
    memberEmail: defaultProperties.memberEmail,
    status: defaultProperties.status,
  };

  return {
    alpha() {
      overrides.memberId = '5000K1234567GEYQA3';
      overrides.memberEmail = 'alpha@email.com';
      return this;
    },

    beta() {
      overrides.memberId = '5000K1234567GEYTE4';
      overrides.memberEmail = 'beta@email.com';
      return this;
    },

    noMatchingSource() {
      overrides.memberId = '5000K1234567GEYRE6';
      overrides.memberEmail = 'nomatchy@email.com';
      return this;
    },

    exists() {
      overrides.groupId = 'ThisSourceExists';
      overrides.memberId = 'ThisSourceExists';
      overrides.memberEmail = 'exists@email.com';
      return this;
    },

    invalid() {
      overrides.memberId = '';
      overrides.memberEmail = '';
      return this;
    },

    /**
     * For this object we don't do updates
     * It just returns the object
     */
    updated() {
      overrides.memberId = 'ThisSourceExists';
      overrides.memberId = 'ThisUsedForUpdating';
      overrides.memberEmail = 'updated@email.com';
      return this;
    },

    doesntExist() {
      overrides.memberId = 'DoesntExist';
      overrides.memberEmail = 'noexists@email.com';
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
      const item = this.buildNoCheck();
      return {
        source: item.source,
        groupId: item.groupId,
        memberId: item.memberId,
        memberEmail: item.memberEmail,
        status: item.status,
      } as GroupMemberSourceResponseDto;
    },

    buildFindByMemberIdGroupMemberSourceDto(): FindGroupMemberSourceDto {
      const build = this.buildNoCheck();
      return {
        identifier: 'memberId',
        value: build.memberId,
        source,
        parentId: build.groupId,
      } as FindGroupMemberSourceDto;
    },

    buildFindByEmailGroupMemberSourceDto(): FindGroupMemberSourceDto {
      const build = this.buildNoCheck();
      return {
        identifier: 'memberEmail',
        value: build.memberEmail,
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
      const member = MemberBuilder().doesntExist().build();
      const groupMember =
        g || GroupMemberBuilder().noSourceExists().build(member);
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
