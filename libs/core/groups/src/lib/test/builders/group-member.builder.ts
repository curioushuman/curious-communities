import { prepareExternalIdSourceValue } from '@curioushuman/common';
import { CreateGroupMemberDto } from '../../application/commands/create-group-member/create-group-member.dto';
import { UpdateGroupMemberDto } from '../../application/commands/update-group-member/update-group-member.dto';
import { FindGroupMemberDto } from '../../application/queries/find-group-member/find-group-member.dto';
import { GroupMember } from '../../domain/entities/group-member';
import {
  StandardGroupMember,
  StandardGroupMemberBase,
} from '../../domain/entities/standard-group-member';
import { GroupMemberSource } from '../../domain/entities/group-member-source';
import { GroupMemberSourceIdSource } from '../../domain/value-objects/group-member-source-id-source';
import { GroupMemberStatus } from '../../domain/value-objects/group-member-status';
import { GroupMemberType } from '../../domain/value-objects/group-member-type';
import {
  StandardGroupMemberBaseResponseDto,
  StandardGroupMemberResponseDto,
} from '../../infra/dto/standard-group-member.response.dto';
import { UpsertCourseGroupMemberRequestDto } from '../../infra/upsert-course-group-member/dto/upsert-course-group-member.request.dto';
import config from '../../static/config';
import { GroupMemberSourceBuilder } from './group-member-source.builder';
import { GroupBuilder } from './group.builder';
import { CourseGroupMember } from '../../domain/entities/course-group-member';
import {
  CourseGroupMemberBaseResponseDto,
  CourseGroupMemberResponseDto,
} from '../../infra/dto/course-group-member.response.dto';

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
    _type: config.defaults.groupTypeStandard as GroupMemberType,
    id: '6fce9d10-aeed-4bb1-8c8c-92094f1982ff',
    memberId: 'bd4dfd87-70c1-4a6f-b590-b3bbfce99f51',
    groupId: '5aad9387-2bfb-4391-82b3-8501a4fca58e',

    sourceIds: [
      {
        id: '5008s1234519CjIPPU',
        source: config.defaults.primaryAccountSource,
      },
    ],

    status: 'pending' as GroupMemberStatus,
    name: 'James Brown',
    email: 'james@brown.com',
    organisationName: 'James Co',
    accountOwner: config.defaults.accountOwner,
  };
  const overrides: GroupMemberLooseMimic = {
    _type: defaultProperties._type,
    id: defaultProperties.id,
    memberId: defaultProperties.memberId,
    groupId: defaultProperties.groupId,

    sourceIds: defaultProperties.sourceIds,

    status: defaultProperties.status,
    name: defaultProperties.name,
    email: defaultProperties.email,
    organisationName: defaultProperties.organisationName,

    accountOwner: defaultProperties.accountOwner,
  };
  /**
   * This is for our course group members
   */
  const courseGroupMemberOverrides = {
    _type: config.defaults.groupTypeCourse as GroupMemberType,
    courseId: '5b3b079d-42b1-4a30-9c20-dc3f7299e1cc',
    participantId: '5b3b079d-42b1-4a30-9c20-dc3f7299e1cc',
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
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = GroupMemberSourceBuilder().beta().buildNoCheck();
      this.setSource(source);
      return this;
    },

    invalidSource() {
      const source = GroupMemberSourceBuilder().invalid().buildNoCheck();
      this.setSource(source);
      return this;
    },

    invalidStatus() {
      const source = GroupMemberSourceBuilder().invalidStatus().buildNoCheck();
      this.setSource(source);
      return this;
    },

    noSourceExists() {
      overrides.sourceIds = [];
      overrides.email = 'no@exist.com';
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
      overrides.id = '1e72ef98-f21e-4e0a-aff1-a45ed7328456';
      return this;
    },

    exists() {
      const source = GroupMemberSourceBuilder().exists().buildNoCheck();
      this.setSource(source);
      overrides.name = source.name;
      return this;
    },

    existsAlpha() {
      overrides.id = 'a54f148b-438e-47a1-a7ed-0c408387a688';
      return this;
    },

    updated() {
      const source = GroupMemberSourceBuilder().updated().buildNoCheck();
      this.setSource(source);
      overrides.id = '2f829239-b878-468c-80b0-8a0d3dfae027';
      overrides.name = 'Name Updated';
      return this;
    },

    updatedAlpha() {
      const source = GroupMemberSourceBuilder().updatedAlpha().buildNoCheck();
      this.setSource(source);
      overrides.id = '88d9b47c-75dc-4be8-b2ee-93e578510399';
      overrides.name = 'Name Updated alpha';
      return this;
    },

    existsCourse() {
      courseGroupMemberOverrides.courseId =
        'b2b28292-563b-4f3c-8df4-995470b46283';
      courseGroupMemberOverrides.participantId =
        'b4657524-1016-485a-82a4-0dd977b39abe';
      return this;
    },

    updatedCourse() {
      courseGroupMemberOverrides.courseId =
        'b695dda1-47a1-4750-b7c4-af245a89f3c0';
      courseGroupMemberOverrides.participantId =
        'b7b42a6f-49d6-4705-91e2-935330e20022';
      return this;
    },

    updatedCourseAlpha() {
      courseGroupMemberOverrides.courseId =
        '73cd86a9-a297-4f67-a718-bc67cc7e3423';
      courseGroupMemberOverrides.participantId =
        'd30f69be-ee97-42fb-bad6-0393666b74b6';
      return this;
    },

    doesntExist() {
      overrides.id = '032a54aa-0e1f-4a54-8cd5-ba58f23a8a2a';
      courseGroupMemberOverrides.courseId =
        'c0de1be9-6c00-4fb7-88c7-ca53f5af51ce';
      courseGroupMemberOverrides.participantId =
        'f7cc9761-1581-4c96-9486-94fecaa78bca';
      overrides.sourceIds = [
        {
          id: 'NoExisty',
          source: config.defaults.primaryAccountSource,
        },
      ];
      return this;
    },

    fromSource(source: GroupMemberSource) {
      this.setSource(source);
      return this;
    },

    /**
     * UPDATE: no longer checking in builder
     * too many unnecessary issues
     */
    buildBase(): StandardGroupMemberBase {
      return this.buildBaseNoCheck();
    },

    buildBaseNoCheck(): StandardGroupMemberBase {
      const groupMember = {
        ...defaultProperties,
        ...overrides,
      };
      return groupMember as StandardGroupMemberBase;
    },

    /**
     * UPDATE: no longer checking in builder
     * too many unnecessary issues
     */
    build(): StandardGroupMember {
      return this.buildNoCheck();
    },

    buildNoCheck(): StandardGroupMember {
      const groupMemberBase = {
        ...defaultProperties,
        ...overrides,
      };
      const group = GroupBuilder().exists().buildBaseNoCheck();
      return {
        ...groupMemberBase,
        group,
      } as StandardGroupMember;
    },

    buildCourseGroupMember(): CourseGroupMember {
      return this.buildCourseGroupMemberNoCheck();
    },

    buildCourseGroupMemberNoCheck(): CourseGroupMember {
      const groupMemberBase = {
        ...defaultProperties,
        ...overrides,
        ...courseGroupMemberOverrides,
      };
      const group = GroupBuilder().existsCourse().buildCourseGroupBaseNoCheck();
      // the above two checks are sufficient
      return {
        ...groupMemberBase,
        group,
      } as CourseGroupMember;
    },

    buildFindByIdSourceValueGroupMemberDto(): FindGroupMemberDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        identifier: 'idSourceValue',
        value: prepareExternalIdSourceValue(sourceId.id, sourceId.source),
      } as FindGroupMemberDto;
    },

    buildFindByParticipantIdGroupMemberDto(): FindGroupMemberDto {
      return {
        identifier: 'participantId',
        value: this.buildCourseGroupMemberNoCheck().participantId,
      } as FindGroupMemberDto;
    },

    buildCreateGroupMemberDto(gms?: GroupMemberSource): CreateGroupMemberDto {
      // default is successful path
      const groupMemberSource =
        gms || GroupMemberSourceBuilder().beta().buildNoCheck();
      return { groupMemberSource } as CreateGroupMemberDto;
    },

    buildCreateCourseGroupMemberDto(): CreateGroupMemberDto {
      const build = this.doesntExist().buildCourseGroupMemberNoCheck();
      const group = GroupBuilder().existsCourse().buildCourseGroupBaseNoCheck();
      return {
        group,
        participant: {
          id: 'f21cd3d7-a7a9-471b-929a-8180c7dd2368',
          memberId: build.memberId,
          courseId: group.courseId,
          groupId: 'SourceIdSoNoMatter',
          status: build.status,
          name: build.name,
          email: build.email,
          organisationName: build.organisationName,
          accountOwner: build.accountOwner,
        },
      } as CreateGroupMemberDto;
    },

    buildCreateCourseGroupMemberRequestDto(): UpsertCourseGroupMemberRequestDto {
      const build = this.doesntExist().buildCourseGroupMemberNoCheck();
      const group = GroupBuilder().existsCourse().buildCourseGroupBaseNoCheck();
      return {
        participant: {
          id: '47c847fa-b2ee-4ee7-aa92-fe81dad8a6aa',
          memberId: build.memberId,
          courseId: group.courseId,
          groupId: 'SourceIdSoNoMatter',
          status: build.status,
          name: build.name,
          email: build.email,
          organisationName: build.organisationName,
          accountOwner: build.accountOwner,
        },
      } as UpsertCourseGroupMemberRequestDto;
    },

    buildUpdateGroupMemberDto(gms?: GroupMemberSource): UpdateGroupMemberDto {
      // default is successful path
      const groupMemberSource =
        gms || GroupMemberSourceBuilder().updated().buildNoCheck();
      const groupMember = this.buildNoCheck();
      return { groupMemberSource, groupMember } as UpdateGroupMemberDto;
    },

    buildUpdateCourseGroupMemberDto(): UpdateGroupMemberDto {
      const groupMember = this.buildCourseGroupMemberNoCheck();
      const group = GroupBuilder().existsCourse().buildCourseGroupBaseNoCheck();
      return {
        groupMember,
        participant: {
          id: groupMember.participantId,
          memberId: groupMember.memberId,
          courseId: group.courseId,
          groupId: 'SourceIdSoNoMatter',
          status: groupMember.status,
          name: groupMember.name === '' ? '' : `${groupMember.name} updated`,
          email: groupMember.email,
          organisationName: groupMember.organisationName,
          accountOwner: groupMember.accountOwner,
        },
      } as UpdateGroupMemberDto;
    },

    buildUpdateCourseGroupMemberRequestDto(): UpsertCourseGroupMemberRequestDto {
      const groupMember = this.buildCourseGroupMemberNoCheck();
      const group = GroupBuilder().existsCourse().buildCourseGroupBaseNoCheck();
      return {
        participant: {
          id: groupMember.participantId,
          memberId: groupMember.memberId,
          courseId: group.courseId,
          groupId: 'SourceIdSoNoMatter',
          status: groupMember.status,
          name: groupMember.name === '' ? '' : `${groupMember.name} updated`,
          email: groupMember.email,
          organisationName: groupMember.organisationName,
          accountOwner: groupMember.accountOwner,
        },
      } as UpsertCourseGroupMemberRequestDto;
    },

    buildGroupMemberBaseResponseDto(): StandardGroupMemberBaseResponseDto {
      const sourceIds = overrides.sourceIds as GroupMemberSourceIdSource[];
      const dto = {
        ...defaultProperties,
        ...overrides,
        sourceIds: sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
      };
      delete dto.group;
      return dto as StandardGroupMemberBaseResponseDto;
    },

    buildGroupMemberResponseDto(): StandardGroupMemberResponseDto {
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
      return dto as StandardGroupMemberResponseDto;
    },

    buildCourseGroupMemberBaseResponseDto(): CourseGroupMemberBaseResponseDto {
      const dto = {
        ...defaultProperties,
        ...overrides,
        ...courseGroupMemberOverrides,
        sourceIds: [],
      };
      delete dto.group;
      return dto as CourseGroupMemberBaseResponseDto;
    },

    buildCourseGroupMemberResponseDto(): CourseGroupMemberResponseDto {
      const groupResponseDto = GroupBuilder()
        .existsCourse()
        .buildCourseGroupBaseResponseDto();
      const dto = {
        ...defaultProperties,
        ...overrides,
        ...courseGroupMemberOverrides,
        sourceIds: [],
        group: groupResponseDto,
      };
      return dto as CourseGroupMemberResponseDto;
    },
  };
};
