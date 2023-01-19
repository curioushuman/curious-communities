import { Group, GroupBase } from '../../domain/entities/group';
import { GroupSource } from '../../domain/entities/group-source';
import {
  GroupBaseResponseDto,
  GroupResponseDto,
} from '../../infra/dto/group.response.dto';
import { GroupSourceBuilder } from './group-source.builder';
import config from '../../static/config';
import { GroupStatus } from '../../domain/value-objects/group-status';
import { FindCourseGroupDto } from '../../application/queries/find-course-group/find-course-group.dto';
import { prepareExternalIdSourceValue } from '@curioushuman/common';
import { GroupSourceIdSource } from '../../domain/value-objects/group-source-id-source';
import { GroupType } from '../../domain/value-objects/group-type';
import { CourseGroup } from '../../domain/entities/course-group';
import { CreateCourseGroupDto } from '../../application/commands/create-course-group/create-course-group.dto';
import { CreateCourseGroupRequestDto } from '../../infra/create-course-group/dto/create-course-group.request.dto';
import { CourseDto } from '../../infra/dto/course.dto';
import { GroupId } from '../../domain/value-objects/group-id';
import { UpdateCourseGroupDto } from '../../application/commands/update-course-group/update-course-group.dto';
import { UpdateCourseGroupRequestDto } from '../../infra/update-course-group/dto/update-course-group.request.dto';
import { GroupMemberBuilder } from './group-member.builder';

/**
 * A builder for Groups to play with in testing.
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
 * This is basically a looser mimic of Group
 * For the purpose of being able to create invalid Groups & DTOs and such
 */
type GroupLooseMimic = {
  [K in keyof Group]?: Group[K] | string | number | object;
};

export const GroupBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: GroupLooseMimic = {
    id: '6fce9d10-aeed-4bb1-8c8c-92094f1982ff',
    status: 'pending' as GroupStatus,
    type: config.defaults.groupType as GroupType,
    slug: 'brown-group',

    sourceIds: [
      {
        id: '5008s1234519CjIPPU',
        source: config.defaults.primaryAccountSource,
      },
    ],

    name: 'Brown group',

    accountOwner: config.defaults.accountOwner,
  };
  const overrides: GroupLooseMimic = {
    id: defaultProperties.id,
    status: defaultProperties.status,
    type: defaultProperties.type,
    slug: defaultProperties.slug,

    sourceIds: defaultProperties.sourceIds,

    name: defaultProperties.name,

    accountOwner: defaultProperties.accountOwner,
  };
  /**
   * This is for our course groups
   */
  const courseGroupOverrides = {
    courseId: '5b3b079d-42b1-4a30-9c20-dc3f7299e1cc',
    type: config.defaults.courseGroupType as GroupType,
  };

  return {
    setSource(source: GroupSource) {
      overrides.sourceIds = [
        {
          id: source.id,
          source: config.defaults.primaryAccountSource,
        },
      ];
    },

    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = GroupSourceBuilder().alpha().buildNoCheck();
      this.setSource(source);
      overrides.name = source.name;
      courseGroupOverrides.courseId = '56b211d8-041a-432a-80e8-06cad92888c0';
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = GroupSourceBuilder().beta().buildNoCheck();
      this.setSource(source);
      overrides.name = source.name;
      courseGroupOverrides.courseId = 'a69138e3-d544-45e1-a517-8779d6dc6cb2';
      return this;
    },

    invalidSource() {
      const source = GroupSourceBuilder().invalidSource().buildNoCheck();
      this.setSource(source);
      return this;
    },

    invalidStatus() {
      const source = GroupSourceBuilder().invalidStatus().buildNoCheck();
      this.setSource(source);
      return this;
    },

    noSourceExists() {
      overrides.sourceIds = [];
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
      const source = GroupSourceBuilder().exists().build();
      this.setSource(source);
      overrides.name = source.name;
      return this;
    },

    updated() {
      const source = GroupSourceBuilder().updated().build();
      this.setSource(source);
      overrides.status = source.status;
      overrides.name = source.name;
      return this;
    },

    existsAlpha() {
      const source = GroupSourceBuilder().exists().build();
      this.setSource(source);
      overrides.name = source.name;
      return this;
    },

    updatedAlpha() {
      const source = GroupSourceBuilder().updatedAlpha().build();
      this.setSource(source);
      overrides.status = source.status;
      overrides.name = source.name;
      return this;
    },

    doesntExist() {
      overrides.id = '032a54aa-0e1f-4a54-8cd5-ba58f23a8a2a';
      courseGroupOverrides.courseId = 'c0de1be9-6c00-4fb7-88c7-ca53f5af51ce';
      return this;
    },

    fromSource(source: GroupSource) {
      this.setSource(source);
      return this;
    },

    buildBase(): GroupBase {
      return GroupBase.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    build(): Group {
      const group = {
        ...defaultProperties,
        ...overrides,
      };
      group.members = [GroupMemberBuilder().exists().buildBase()];
      return Group.check(group);
    },

    buildCourseGroup(): CourseGroup {
      const group = {
        ...defaultProperties,
        ...overrides,
        ...courseGroupOverrides,
      };
      group.members = [GroupMemberBuilder().exists().buildBase()];
      return CourseGroup.check(group);
    },

    buildBaseNoCheck(): GroupBase {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupBase;
    },

    buildNoCheck(): Group {
      const group = {
        ...defaultProperties,
        ...overrides,
      };
      group.members = [GroupMemberBuilder().exists().buildBase()];
      return group as Group;
    },

    buildCourseGroupNoCheck(): CourseGroup {
      const group = {
        ...defaultProperties,
        ...overrides,
        ...courseGroupOverrides,
      };
      group.members = [GroupMemberBuilder().exists().buildBase()];
      return group as CourseGroup;
    },

    buildCreateCourseGroupDto(): CreateCourseGroupDto {
      const group = this.buildCourseGroupNoCheck();
      group.id = '9dd38646-112e-436c-b871-e234145e842c' as GroupId;
      return {
        group,
      } as CreateCourseGroupDto;
    },

    buildCreateCourseGroupRequestDto(): CreateCourseGroupRequestDto {
      const group = this.buildCourseGroupNoCheck();
      return {
        course: {
          id: group.courseId as string,
          status: group.status as string,
          name: group.name as string,
          accountOwner: group.accountOwner as string,
        } as CourseDto,
      } as CreateCourseGroupRequestDto;
    },

    buildFindByIdCourseGroupDto(): FindCourseGroupDto {
      return {
        identifier: 'id',
        value: this.buildNoCheck().id,
      } as FindCourseGroupDto;
    },

    // buildFindByIdGroupRequestDto(): FindByIdGroupRequestDto {
    //   return {
    //     id: this.buildNoCheck().id,
    //   } as FindByIdGroupRequestDto;
    // },

    buildFindByIdSourceValueCourseGroupDto(): FindCourseGroupDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        identifier: 'idSourceValue',
        value: prepareExternalIdSourceValue(sourceId.id, sourceId.source),
      } as FindCourseGroupDto;
    },

    // buildFindByIdSourceValueGroupRequestDto(): FindByIdSourceValueGroupRequestDto {
    //   const sourceId = this.buildNoCheck().sourceIds[0];
    //   return {
    //     idSourceValue: prepareExternalIdSourceValue(
    //       sourceId.id,
    //       sourceId.source
    //     ),
    //   } as FindByIdSourceValueGroupRequestDto;
    // },

    buildFindBySlugCourseGroupDto(): FindCourseGroupDto {
      return {
        identifier: 'slug',
        value: this.buildNoCheck().slug,
      } as FindCourseGroupDto;
    },

    // buildFindBySlugGroupRequestDto(): FindBySlugGroupRequestDto {
    //   return {
    //     slug: this.buildNoCheck().slug,
    //   } as FindBySlugGroupRequestDto;
    // },

    // buildUpdateGroupDto(): UpdateGroupDto {
    //   const sourceId = this.buildNoCheck().sourceIds[0];
    //   return sourceId as UpdateGroupDto;
    // },

    buildUpdateCourseGroupDto(): UpdateCourseGroupDto {
      const group = this.buildCourseGroupNoCheck();
      return {
        course: {
          id: group.courseId,
          status: group.status as GroupStatus,
          name: 'An updated name',
          accountOwner: group.accountOwner,
        } as CourseDto,
      } as UpdateCourseGroupDto;
    },

    buildUpdateCourseGroupRequestDto(): UpdateCourseGroupRequestDto {
      const group = this.buildCourseGroupNoCheck();
      return {
        course: {
          id: group.courseId as string,
          status: group.status as string,
          name: 'An updated name',
          accountOwner: group.accountOwner as string,
        } as CourseDto,
      } as UpdateCourseGroupRequestDto;
    },

    buildGroupResponseDto(): GroupResponseDto {
      const sourceIds = overrides.sourceIds as GroupSourceIdSource[];
      return GroupResponseDto.check({
        ...defaultProperties,
        ...overrides,
        sourceIds: sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
        members: [
          GroupMemberBuilder().exists().buildGroupMemberBaseResponseDto(),
        ],
      });
    },

    buildGroupBaseResponseDto(): GroupBaseResponseDto {
      const sourceIds = overrides.sourceIds as GroupSourceIdSource[];
      const dto = {
        ...defaultProperties,
        ...overrides,
        sourceIds: sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
      };
      return GroupBaseResponseDto.check(dto);
    },
  };
};
