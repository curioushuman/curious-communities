import {
  GroupMember,
  GroupMemberBase,
  GroupMemberForIdentify,
} from '../../domain/entities/group-member';
import { GroupMemberSource } from '../../domain/entities/group-member-source';
import { GroupMemberSourceBuilder } from './group-member-source.builder';
import config from '../../static/config';
import { GroupMemberStatus } from '../../domain/value-objects/group-member-status';
import { CreateCourseGroupMemberDto } from '../../application/commands/create-course-group-member/create-course-group-member.dto';
import { GroupBuilder } from './group.builder';
import { UpdateCourseGroupMemberDto } from '../../application/commands/update-course-group-member/update-course-group-member.dto';
import { MutateCourseGroupMemberRequestDto } from '../../infra/dto/mutate-course-group-member.request.dto';
import {
  GroupMemberBaseResponseDto,
  GroupMemberResponseDto,
} from '../../infra/dto/group-member.response.dto';
import { GroupMemberSourceIdSource } from '../../domain/value-objects/group-member-source-id-source';
import { prepareExternalIdSourceValue } from '@curioushuman/common';
import { FindGroupMemberDto } from '../../application/queries/find-group-member/find-group-member.dto';

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
    id: '0b94343f-54b0-4808-bd78-63c38324256b',
    groupId: '6fce9d10-aeed-4bb1-8c8c-92094f1982ff',
    memberId: '55525e35-6022-49c7-9ffc-f67d07321c25',
    status: 'pending' as GroupMemberStatus,

    sourceIds: [
      {
        id: '5008s1234519CjIPPU',
        source: config.defaults.primaryAccountSource,
      },
    ],

    name: 'James Brown',
    email: 'james@brown.com',
    organisationName: 'James Co',

    accountOwner: config.defaults.accountOwner,
  };
  const overrides: GroupMemberLooseMimic = {
    id: defaultProperties.id,
    groupId: defaultProperties.groupId,
    memberId: defaultProperties.memberId,
    status: defaultProperties.status,

    sourceIds: defaultProperties.sourceIds,

    name: defaultProperties.name,
    email: defaultProperties.email,
    organisationName: defaultProperties.organisationName,

    accountOwner: defaultProperties.accountOwner,
  };

  return {
    setSource(source: GroupMemberSource) {
      overrides.sourceIds = [
        {
          id: source.id,
          source: config.defaults.primaryAccountSource,
        },
      ];
    },

    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = GroupMemberSourceBuilder().alpha().buildNoCheck();
      this.setSource(source);
      overrides.email = source.email;
      overrides.id = '9dc28d5e-2e8e-4e7f-88e8-d3b0bff1ff62';
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = GroupMemberSourceBuilder().beta().buildNoCheck();
      this.setSource(source);
      overrides.email = source.email;
      overrides.id = '03a2740e-e1f8-440e-85a7-9dcbd5b900da';
      return this;
    },

    invalidSource() {
      const source = GroupMemberSourceBuilder().invalidSource().buildNoCheck();
      this.setSource(source);
      return this;
    },

    invalidStatus() {
      const source = GroupMemberSourceBuilder().invalidStatus().buildNoCheck();
      this.setSource(source);
      return this;
    },

    noMatchingSource() {
      overrides.sourceIds = [
        {
          id: 'NothingCanBeFoundForThis',
          source: config.defaults.primaryAccountSource,
        },
      ];
      return this;
    },

    noSourceExists() {
      overrides.name = 'NOT FOUND';
      overrides.email = 'not@found.com';
      overrides.sourceIds = [];
      return this;
    },

    invalid() {
      overrides.sourceIds = [
        {
          id: 'ThisIsMeaningless',
          source: 'THISISSOINVALIDRIGHTNOW',
        },
      ];
      return this;
    },

    invalidOther() {
      overrides.status = 'happy';
      return this;
    },

    exists() {
      const source = GroupMemberSourceBuilder().exists().build();
      this.setSource(source);
      overrides.name = source.name;
      overrides.email = source.email;
      return this;
    },

    updated() {
      const source = GroupMemberSourceBuilder().updated().build();
      this.setSource(source);
      overrides.status = 'registered';
      overrides.name = source.name;
      overrides.email = source.email;
      return this;
    },

    existsAlpha() {
      const source = GroupMemberSourceBuilder().existsAlpha().build();
      this.setSource(source);
      overrides.name = source.name;
      overrides.email = source.email;
      return this;
    },

    updatedAlpha() {
      const source = GroupMemberSourceBuilder().updatedAlpha().build();
      this.setSource(source);
      overrides.status = 'registered';
      overrides.name = source.name;
      overrides.email = source.email;
      return this;
    },

    doesntExist() {
      overrides.email = 'doesnt@exist.com';
      return this;
    },

    fromSource(source: GroupMemberSource) {
      this.setSource(source);
      return this;
    },

    buildBase(): GroupMemberBase {
      return GroupMemberBase.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    build(): GroupMember {
      const groupMember = {
        ...defaultProperties,
        ...overrides,
      };
      groupMember.group = GroupBuilder().exists().buildBase();
      return GroupMember.check(groupMember);
    },

    buildBaseNoCheck(): GroupMember {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupMember;
    },

    buildNoCheck(): GroupMemberBase {
      const groupMember = {
        ...defaultProperties,
        ...overrides,
      };
      groupMember.group = GroupBuilder().exists().buildBase();
      return groupMember as GroupMemberBase;
    },

    buildGroupMemberForIdentify(): GroupMemberForIdentify {
      const groupMember = {
        ...defaultProperties,
        ...overrides,
      };
      groupMember.group = GroupBuilder().exists().buildBase();
      delete groupMember.id;
      return GroupMemberForIdentify.check(groupMember);
    },

    buildGroupMemberForIdentifyNoCheck(): GroupMemberForIdentify {
      const groupMember = {
        ...defaultProperties,
        ...overrides,
      };
      groupMember.group = GroupBuilder().exists().buildBase();
      delete groupMember.id;
      return groupMember as GroupMemberForIdentify;
    },

    buildCreateCourseGroupMemberDto(): CreateCourseGroupMemberDto {
      return {
        groupMember: this.buildBaseNoCheck(),
      } as CreateCourseGroupMemberDto;
    },

    buildUpdateCourseGroupMemberDto(): UpdateCourseGroupMemberDto {
      return {
        groupMember: this.buildGroupMemberForIdentifyNoCheck(),
      } as UpdateCourseGroupMemberDto;
    },

    buildMutateCourseGroupMemberRequestDto(): MutateCourseGroupMemberRequestDto {
      const build = this.buildBaseNoCheck();
      const courseGroup = GroupBuilder().exists().buildCourseGroupNoCheck();
      return {
        participant: {
          id: 'ddbfd57f-1af2-4dc5-9f25-24663285886a',
          courseId: courseGroup.courseId,
          memberId: '1d0f699d-862e-4ca1-abde-1cdea4fcc2c8',
          status: build.status,
          name: build.name,
          email: build.email,
          organisationName: build.organisationName,
          accountOwner: config.defaults.accountOwner,
        },
      } as MutateCourseGroupMemberRequestDto;
    },

    buildFindByIdGroupMemberDto(): FindGroupMemberDto {
      return {
        identifier: 'id',
        value: this.buildNoCheck().id,
      } as FindGroupMemberDto;
    },

    // buildFindByIdGroupMemberRequestDto(): FindByIdGroupMemberRequestDto {
    //   return {
    //     id: this.buildNoCheck().id,
    //   } as FindByIdGroupMemberRequestDto;
    // },

    buildFindByIdSourceValueGroupMemberDto(): FindGroupMemberDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        identifier: 'idSourceValue',
        value: prepareExternalIdSourceValue(sourceId.id, sourceId.source),
      } as FindGroupMemberDto;
    },

    // buildFindByIdSourceValueGroupMemberRequestDto(): FindByIdSourceValueGroupMemberRequestDto {
    //   const sourceId = this.buildNoCheck().sourceIds[0];
    //   return {
    //     idSourceValue: prepareExternalIdSourceValue(
    //       sourceId.id,
    //       sourceId.source
    //     ),
    //   } as FindByIdSourceValueGroupMemberRequestDto;
    // },

    buildFindByEntityGroupMemberDto(): FindGroupMemberDto {
      return {
        identifier: 'entity',
        value: this.buildNoCheck(),
      } as FindGroupMemberDto;
    },

    // buildUpdateGroupMemberRequestDto(): UpdateGroupMemberRequestDto {
    //   const sourceIds = this.buildNoCheck().sourceIds;
    //   if (!sourceIds) {
    //     return {
    //       idSourceValue: '',
    //     } as UpdateGroupMemberRequestDto;
    //   }
    //   return {
    //     idSourceValue: prepareExternalIdSourceValue(
    //       sourceIds[0].id,
    //       sourceIds[0].source
    //     ),
    //   } as UpdateGroupMemberRequestDto;
    // },

    buildGroupMemberBaseResponseDto(): GroupMemberBaseResponseDto {
      const sourceIds = overrides.sourceIds as GroupMemberSourceIdSource[];
      const dto = {
        ...defaultProperties,
        ...overrides,
        sourceIds: sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
      };
      delete dto.group;
      return dto as GroupMemberBaseResponseDto;
    },

    buildGroupMemberResponseDto(): GroupMemberResponseDto {
      const sourceIds = overrides.sourceIds as GroupMemberSourceIdSource[];
      const groupResponseDto = GroupBuilder()
        .exists()
        .buildGroupBaseResponseDto();
      const dto = {
        ...defaultProperties,
        ...overrides,
        sourceIds: sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
        group: groupResponseDto,
      };
      // return GroupMemberResponseDto.check(dto);
      return dto as GroupMemberResponseDto;
    },
  };
};
