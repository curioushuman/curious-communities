import { prepareExternalIdSourceValue } from '@curioushuman/common';
import { CreateGroupDto } from '../../application/commands/create-group/create-group.dto';
import { UpdateGroupDto } from '../../application/commands/update-group/update-group.dto';
import { FindGroupDto } from '../../application/queries/find-group/find-group.dto';
import {
  CourseGroup,
  CourseGroupBase,
} from '../../domain/entities/course-group';
import { Group } from '../../domain/entities/group';
import { GroupSource } from '../../domain/entities/group-source';
import { GroupSourceIdSource } from '../../domain/value-objects/group-source-id-source';
import { GroupStatus } from '../../domain/value-objects/group-status';
import { GroupType } from '../../domain/value-objects/group-type';
import {
  StandardGroupBaseResponseDto,
  StandardGroupResponseDto,
} from '../../infra/dto/standard-group.response.dto';
import {
  CourseGroupBaseResponseDto,
  CourseGroupResponseDto,
} from '../../infra/dto/course-group.response.dto';
import { UpsertCourseGroupRequestDto } from '../../infra/upsert-course-group/dto/upsert-course-group.request.dto';
import config from '../../static/config';

import { GroupMemberBuilder } from './group-member.builder';
import { GroupSourceBuilder } from './group-source.builder';
import {
  StandardGroup,
  StandardGroupBase,
} from '../../domain/entities/standard-group';
import { CourseDto } from '../../infra/dto/course.dto';

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
    _type: config.defaults.groupTypeStandard as GroupType,
    id: '6fce9d10-aeed-4bb1-8c8c-92094f1983ff',

    sourceIds: [
      {
        id: '5008s1234519CjIPPU',
        source: config.defaults.primaryAccountSource,
      },
    ],

    status: 'pending' as GroupStatus,
    slug: 'brown-group',
    name: 'Brown group',
    accountOwner: config.defaults.accountOwner,
  };
  const overrides: GroupLooseMimic = {
    _type: defaultProperties._type,
    id: defaultProperties.id,

    sourceIds: defaultProperties.sourceIds,

    status: defaultProperties.status,
    slug: defaultProperties.slug,
    name: defaultProperties.name,
    accountOwner: defaultProperties.accountOwner,
  };
  /**
   * This is for our course groups
   */
  const courseGroupOverrides = {
    _type: config.defaults.groupTypeCourse as GroupType,
    courseId: '5b3b079d-42b1-4a30-9c20-dc3f7299e1cc',
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
      const source = GroupSourceBuilder().invalid().buildNoCheck();
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
      overrides.name = 'No source exists';
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
      overrides.name = '';
      overrides.id = '4109c482-3267-492c-af78-ba9b7178c695';
      return this;
    },

    exists() {
      const source = GroupSourceBuilder().exists().buildNoCheck();
      this.setSource(source);
      overrides.name = source.name;
      return this;
    },

    existsAlpha() {
      overrides.id = '07770ecf-eb5f-435f-90a9-5dee0b3b8baa';
      return this;
    },

    updated() {
      const source = GroupSourceBuilder().updated().buildNoCheck();
      this.setSource(source);
      overrides.id = '6fce9d10-aeed-4bb1-8c8c-92094f1567yy';
      overrides.name = 'Updated group';
      return this;
    },

    updatedAlpha() {
      const source = GroupSourceBuilder().updatedAlpha().buildNoCheck();
      this.setSource(source);
      overrides.id = '6fce9d10-aeed-4bb1-8c8c-92094f1789yy';
      overrides.name = 'Updated alpha group';
      return this;
    },

    existsCourse() {
      overrides.id = 'b2b28292-563b-4f3c-8df4-995470b46275';
      courseGroupOverrides.courseId = 'b2b28292-563b-4f3c-8df4-995470b46283';
      return this;
    },

    existsCourseAlpha() {
      overrides.id = 'b2b28292-563b-4f3c-8df4-995470b46276';
      courseGroupOverrides.courseId = 'b2b28292-563b-4f3c-8df4-995470b46284';
      return this;
    },

    updatedCourse() {
      courseGroupOverrides.courseId = 'b695dda1-47a1-4750-b7c4-af245a89f3c0';
      return this;
    },

    updatedCourseAlpha() {
      courseGroupOverrides.courseId = '73cd86a9-a297-4f67-a718-bc67cc7e3423';
      return this;
    },

    doesntExist() {
      overrides.id = '032a54aa-0e1f-4a54-8cd5-ba58f23a8a2a';
      courseGroupOverrides.courseId = 'c0de1be9-6c00-4fb7-88c7-ca53f5af51ce';
      overrides.sourceIds = [
        {
          id: 'NoExisty',
          source: config.defaults.primaryAccountSource,
        },
      ];
      return this;
    },

    fromSource(source: GroupSource) {
      this.setSource(source);
      return this;
    },

    /**
     * UPDATE: no longer checking in builder
     * too many unnecessary issues
     */
    buildBase(): StandardGroupBase {
      return this.buildBaseNoCheck();
    },

    buildBaseNoCheck(): StandardGroupBase {
      return {
        ...defaultProperties,
        ...overrides,
      } as StandardGroupBase;
    },

    build(): StandardGroup {
      return this.buildNoCheck();
    },

    buildNoCheck(): StandardGroup {
      const group = {
        ...defaultProperties,
        ...overrides,
      };
      const groupMembers = [GroupMemberBuilder().exists().buildBaseNoCheck()];
      return {
        ...group,
        groupMembers,
      } as StandardGroup;
    },

    buildCourseGroupBase(): CourseGroupBase {
      return this.buildCourseGroupBaseNoCheck();
    },

    buildCourseGroupBaseNoCheck(): CourseGroupBase {
      return {
        ...defaultProperties,
        ...overrides,
        ...courseGroupOverrides,
      } as CourseGroupBase;
    },

    buildCourseGroup(): CourseGroup {
      return this.buildCourseGroupNoCheck();
    },

    buildCourseGroupNoCheck(): CourseGroup {
      const group = {
        ...defaultProperties,
        ...overrides,
        ...courseGroupOverrides,
      };
      const groupMembers = [GroupMemberBuilder().exists().buildBaseNoCheck()];
      return {
        ...group,
        groupMembers,
      } as CourseGroup;
    },

    buildFindByIdGroupDto(): FindGroupDto {
      return {
        identifier: 'id',
        value: this.buildNoCheck().id,
      } as FindGroupDto;
    },

    buildFindByIdSourceValueGroupDto(): FindGroupDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        identifier: 'idSourceValue',
        value: prepareExternalIdSourceValue(sourceId.id, sourceId.source),
      } as FindGroupDto;
    },

    buildFindBySlugGroupDto(): FindGroupDto {
      return {
        identifier: 'slug',
        value: this.buildNoCheck().slug,
      } as FindGroupDto;
    },

    buildFindByCourseIdGroupDto(): FindGroupDto {
      return {
        identifier: 'courseId',
        value: this.buildCourseGroupNoCheck().courseId,
      } as FindGroupDto;
    },

    buildCreateGroupDto(gs?: GroupSource): CreateGroupDto {
      // default is successful path
      const groupSource = gs || GroupSourceBuilder().beta().buildNoCheck();
      return { groupSource } as CreateGroupDto;
    },

    buildCreateCourseGroupDto(): CreateGroupDto {
      const build = this.doesntExist().buildCourseGroupBaseNoCheck();
      return {
        course: {
          id: '7f694ca5-5a0e-4f10-a580-d1bc44c8c0ca',
          status: build.status,
          name: build.name,
          accountOwner: build.accountOwner,
        },
      } as CreateGroupDto;
    },

    buildCreateCourseGroupRequestDto(): UpsertCourseGroupRequestDto {
      const build = this.doesntExist().buildCourseGroupBaseNoCheck();
      return {
        course: {
          id: '5fe657c9-52cf-441b-9ab7-a60e116a0293',
          status: build.status,
          name: build.name,
          accountOwner: build.accountOwner,
        },
      } as UpsertCourseGroupRequestDto;
    },

    buildUpdateGroupDto(gs?: GroupSource): UpdateGroupDto {
      // default is successful path
      const groupSource = gs || GroupSourceBuilder().updated().buildNoCheck();
      const group = this.buildNoCheck();
      return { groupSource, group } as UpdateGroupDto;
    },

    buildUpdateCourseGroupDto(): UpdateGroupDto {
      const group = this.updatedCourse().buildCourseGroupNoCheck();
      return {
        group,
        course: {
          id: group.courseId,
          status: group.status as GroupStatus,
          name: group.name === '' ? '' : `${group.name} updated`,
          accountOwner: group.accountOwner,
        } as CourseDto,
      } as UpdateGroupDto;
    },

    buildUpdateCourseGroupRequestDto(): UpsertCourseGroupRequestDto {
      const group = this.updatedCourseAlpha().buildCourseGroupNoCheck();
      return {
        course: {
          id: group.courseId as string,
          status: group.status as string,
          name: group.name === '' ? '' : `${group.name} updated`,
          accountOwner: group.accountOwner as string,
        } as CourseDto,
      } as UpsertCourseGroupRequestDto;
    },

    buildGroupResponseDto(): StandardGroupResponseDto {
      const sourceIds = overrides.sourceIds as GroupSourceIdSource[];
      return {
        ...defaultProperties,
        ...overrides,
        sourceIds: sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
        groupMembers: [
          GroupMemberBuilder().exists().buildGroupMemberBaseResponseDto(),
        ],
      } as StandardGroupResponseDto;
    },

    buildGroupBaseResponseDto(): StandardGroupBaseResponseDto {
      const sourceIds = overrides.sourceIds as GroupSourceIdSource[];
      const dto = {
        ...defaultProperties,
        ...overrides,
        sourceIds: sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
      };
      return dto as StandardGroupBaseResponseDto;
    },

    buildCourseGroupResponseDto(): CourseGroupResponseDto {
      return {
        ...defaultProperties,
        ...overrides,
        ...courseGroupOverrides,
        sourceIds: [],
        groupMembers: [
          GroupMemberBuilder().exists().buildCourseGroupMemberBaseResponseDto(),
        ],
      } as CourseGroupResponseDto;
    },

    buildCourseGroupBaseResponseDto(): CourseGroupBaseResponseDto {
      const dto = {
        ...defaultProperties,
        ...overrides,
        ...courseGroupOverrides,
        sourceIds: [],
      };
      return dto as CourseGroupBaseResponseDto;
    },
  };
};
