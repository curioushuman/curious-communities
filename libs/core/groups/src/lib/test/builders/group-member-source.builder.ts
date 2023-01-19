import { ExternalId } from '@curioushuman/common';
import { CreateGroupMemberSourceDto } from '../../application/commands/create-group-member-source/create-group-member-source.dto';
import { UpdateGroupMemberSourceDto } from '../../application/commands/update-group-member-source/update-group-member-source.dto';
import { FindGroupMemberSourceDto } from '../../application/queries/find-group-member-source/find-group-member-source.dto';

import { GroupMemberSource } from '../../domain/entities/group-member-source';
import { GroupMemberName } from '../../domain/value-objects/group-member-name';
import { GroupMemberSourceStatus } from '../../domain/value-objects/group-member-source-status';
import { UpsertGroupMemberSourceRequestDto } from '../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import config from '../../static/config';
import { GroupMemberBuilder } from './group-member.builder';
import { GroupBuilder } from './group.builder';

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
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: GroupMemberSourceLooseMimic = {
    id: '5008s1234519CjIPPU',
    groupId: '5008s1234519CjIAAH',
    status: 'pending' as GroupMemberSourceStatus,

    name: 'James Brown',
    email: 'james@brown.com',
    organisationName: 'James Co',
  };
  const overrides: GroupMemberSourceLooseMimic = {
    id: defaultProperties.id,
    groupId: defaultProperties.groupId,
    status: defaultProperties.status,

    name: defaultProperties.name,
    email: defaultProperties.email,
    organisationName: defaultProperties.organisationName,
  };

  let source = config.defaults.primaryAccountSource;

  return {
    alpha() {
      overrides.id = '5000K1234567GEYQA3';
      overrides.name = 'Jim Brown';
      overrides.email = 'jim@brown.com';
      return this;
    },

    beta() {
      overrides.id = '5008s000000y7LUAAY';
      overrides.name = 'June Brown';
      overrides.email = 'june@brown.com';
      return this;
    },

    alternateSource() {
      source = 'MICRO-COURSE';
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
      overrides.status = 'this is invalid';
      return this;
    },

    invalidSource() {
      overrides.name = '';
      return this;
    },

    exists() {
      overrides.id = ExternalId.check('ThisSourceExists');
      overrides.groupId = ExternalId.check('ThisSourceExists');
      overrides.name = 'Jade Green';
      overrides.email = 'jade@green.com';
      return this;
    },

    updated() {
      overrides.id = ExternalId.check('ThisSourceExists');
      overrides.groupId = ExternalId.check('ThisSourceExists');
      overrides.name = 'Jade Green';
      overrides.email = 'jade@green.com';
      overrides.status = 'registered';
      return this;
    },

    existsAlpha() {
      overrides.id = ExternalId.check('ThisSourceExistsAlpha');
      overrides.groupId = ExternalId.check('ThisSourceExistsAlpha');
      overrides.name = 'Alpha Pink';
      overrides.email = 'alpha@pink.com';
      return this;
    },

    updatedAlpha() {
      overrides.id = ExternalId.check('ThisSourceExists');
      overrides.groupId = ExternalId.check('ThisSourceExists');
      overrides.name = 'Alpha Pink';
      overrides.email = 'alpha@pink.com';
      overrides.status = 'registered';
      return this;
    },

    doesntExist() {
      overrides.id = ExternalId.check('NothingExistsHere');
      overrides.groupId = ExternalId.check('ThisSourceExists');
      overrides.name = 'Nothing Exists';
      overrides.email = 'nothing@exists.com';
      return this;
    },

    build(): GroupMemberSource {
      return GroupMemberSource.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): GroupMemberSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupMemberSource;
    },

    buildFindByIdSourceValueGroupMemberSourceDto(): FindGroupMemberSourceDto {
      const build = this.buildNoCheck();
      return {
        identifier: 'idSource',
        value: {
          id: build.id,
          source,
        },
        source,
      } as FindGroupMemberSourceDto;
    },

    // buildFindByIdSourceValueGroupMemberSourceRequestDto(): FindByIdSourceValueGroupMemberSourceRequestDto {
    //   const build = this.buildNoCheck();
    //   return {
    //     idSourceValue: prepareExternalIdSourceValue(build.id, source),
    //   } as FindByIdSourceValueGroupMemberSourceRequestDto;
    // },

    // buildFindByEmailGroupMemberSourceDto(): FindGroupMemberSourceDto {
    //   return {
    //     identifier: 'email',
    //     value: this.buildNoCheck().email,
    //   } as FindGroupMemberSourceDto;
    // },

    // buildFindByEmailGroupMemberSourceRequestDto(): FindByEmailGroupMemberSourceRequestDto {
    //   return {
    //     email: this.buildNoCheck().email,
    //   } as FindByEmailGroupMemberSourceRequestDto;
    // },

    buildCreateGroupMemberSourceDto(): CreateGroupMemberSourceDto {
      const groupMember = GroupMemberBuilder().noSourceExists().buildNoCheck();
      return {
        source: config.defaults.primaryAccountSource,
        groupMember,
      } as CreateGroupMemberSourceDto;
    },

    buildInvalidCreateGroupMemberSourceDto(): CreateGroupMemberSourceDto {
      const groupMember = GroupMemberBuilder().noSourceExists().buildNoCheck();
      groupMember.name = '' as GroupMemberName;
      return {
        source: config.defaults.primaryAccountSource,
        groupMember,
      } as CreateGroupMemberSourceDto;
    },

    buildUpdateGroupMemberSourceDto(): UpdateGroupMemberSourceDto {
      const groupMember = GroupMemberBuilder().updated().buildNoCheck();
      const groupMemberSource = this.exists().buildNoCheck();
      return {
        source: config.defaults.primaryAccountSource,
        groupMember,
        groupMemberSource,
      } as UpdateGroupMemberSourceDto;
    },

    buildInvalidUpdateGroupMemberSourceDto(): UpdateGroupMemberSourceDto {
      const groupMember = GroupMemberBuilder().exists().buildNoCheck();
      const groupMemberSource = this.exists().buildNoCheck();
      groupMember.name = '' as GroupMemberName;
      return {
        source: config.defaults.primaryAccountSource,
        groupMember,
        groupMemberSource,
      } as UpdateGroupMemberSourceDto;
    },

    buildCreateUpsertGroupMemberSourceRequestDto(): UpsertGroupMemberSourceRequestDto {
      const groupMember = GroupMemberBuilder()
        .noSourceExists()
        .buildGroupMemberResponseDto();
      return {
        source: config.defaults.primaryAccountSource,
        groupMember,
      } as UpsertGroupMemberSourceRequestDto;
    },

    buildUpdateUpsertGroupMemberSourceRequestDto(): UpsertGroupMemberSourceRequestDto {
      const groupMember = GroupMemberBuilder()
        .updated()
        .buildGroupMemberResponseDto();
      return {
        source: config.defaults.primaryAccountSource,
        groupMember,
      } as UpsertGroupMemberSourceRequestDto;
    },

    buildUpdateByEntityUpsertGroupMemberSourceRequestDto(): UpsertGroupMemberSourceRequestDto {
      const groupMember = GroupMemberBuilder()
        .updatedAlpha()
        .buildGroupMemberResponseDto();
      // TODO - it would be better if this could be controlled elsewhere
      // the exists / updated alpha was a recent addition
      const group = GroupBuilder().updatedAlpha().buildGroupBaseResponseDto();
      groupMember.sourceIds = [];
      groupMember.group = group;
      return {
        source: config.defaults.primaryAccountSource,
        groupMember,
      } as UpsertGroupMemberSourceRequestDto;
    },

    buildInvalidUpsertGroupMemberSourceRequestDto(): UpsertGroupMemberSourceRequestDto {
      const groupMember = GroupMemberBuilder()
        .exists()
        .buildGroupMemberResponseDto();
      groupMember.name = '' as GroupMemberName;
      return {
        source: config.defaults.primaryAccountSource,
        groupMember,
      } as UpsertGroupMemberSourceRequestDto;
    },
  };
};
