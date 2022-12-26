import { GroupMember } from '../../domain/entities/group-member';
import { GroupMemberSource } from '../../domain/entities/group-member-source';
import { GroupMemberResponseDto } from '../../infra/dto/group-member.response.dto';
import { CreateGroupMemberRequestDto } from '../../infra/create-group-member/dto/create-group-member.request.dto';
import { CreateGroupMemberDto } from '../../application/commands/create-group-member/create-group-member.dto';
import { GroupMemberSourceBuilder } from './group-member-source.builder';
import config from '../../static/config';
import { GroupMemberStatus } from '../../domain/value-objects/group-member-status';
import { UpdateGroupMemberRequestDto } from '../../infra/update-group-member/dto/update-group-member.request.dto';
import { UpdateGroupMemberDto } from '../../application/commands/update-group-member/update-group-member.dto';

/**
 * A builder for GroupMembers to play with in testing.
 *
 * NOTES
 * - We include alphas, betas etc to overcome duplicates during testing
 *
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of GroupMember
 * For the purpose of being able to create invalid GroupMembers & DTOs and such
 */
type GroupMemberLooseMimic = {
  [K in keyof GroupMember]?: GroupMember[K] | string | number | object;
};

export const GroupMemberBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: GroupMemberLooseMimic = {
    id: '5008s1234519CjIAAU',
    memberId: '5008s1234519CjIABC',
    groupId: '5008s1234519CjIAEF',
    status: 'pending' as GroupMemberStatus,
    memberName: 'James Brown',
    memberEmail: 'james@brown.com',
    memberOrganisationName: 'James Co',
    accountOwner: config.defaults.accountOwner,
  };
  const overrides: GroupMemberLooseMimic = {
    id: defaultProperties.id,
    memberId: defaultProperties.memberId,
    groupId: defaultProperties.groupId,
    status: defaultProperties.status,
    memberName: defaultProperties.memberName,
    memberEmail: defaultProperties.memberEmail,
    memberOrganisationName: defaultProperties.memberOrganisationName,
    accountOwner: defaultProperties.accountOwner,
  };

  return {
    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = GroupMemberSourceBuilder().alpha().buildNoCheck();
      overrides.id = source.id;
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = GroupMemberSourceBuilder().beta().buildNoCheck();
      overrides.id = source.id;
      return this;
    },

    invalidSource() {
      const source = GroupMemberSourceBuilder().invalidSource().buildNoCheck();
      overrides.id = source.id;
      return this;
    },

    invalidStatus() {
      const source = GroupMemberSourceBuilder().invalidStatus().buildNoCheck();
      overrides.id = source.id;
      return this;
    },

    noMatchingSource() {
      overrides.id = 'NoMatchingSource';
      return this;
    },

    invalid() {
      delete defaultProperties.id;
      delete overrides.id;
      return this;
    },

    exists() {
      const source = GroupMemberSourceBuilder().exists().build();
      overrides.id = source.id;
      return this;
    },

    doesntExist() {
      overrides.id = 'GroupMemberDoesntExist';
      delete defaultProperties.id;
      delete overrides.id;
      return this;
    },

    doesntExistId() {
      overrides.id = '1e72ef98-f21e-4e0a-aff1-a45ed7328123';
      delete defaultProperties.id;
      delete overrides.id;
      return this;
    },

    fromSource(source: GroupMemberSource) {
      overrides.id = source.id;
      return this;
    },

    build(): GroupMember {
      return GroupMember.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): GroupMember {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupMember;
    },

    buildCreateGroupMemberDto(): CreateGroupMemberDto {
      return {
        id: this.build().id,
      } as CreateGroupMemberDto;
    },

    buildCreateGroupMemberRequestDto(): CreateGroupMemberRequestDto {
      return {
        id: this.buildNoCheck().id,
      } as CreateGroupMemberRequestDto;
    },

    buildUpdateGroupMemberDto(): UpdateGroupMemberDto {
      return {
        id: this.build().id,
      } as UpdateGroupMemberDto;
    },

    buildUpdateGroupMemberRequestDto(): UpdateGroupMemberRequestDto {
      return {
        id: this.buildNoCheck().id,
      } as UpdateGroupMemberRequestDto;
    },

    buildGroupMemberResponseDto(): GroupMemberResponseDto {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupMemberResponseDto;
    },
  };
};
