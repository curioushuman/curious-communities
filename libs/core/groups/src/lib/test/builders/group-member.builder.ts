import { CreateGroupMemberDto } from '../../application/commands/create-group-member/create-group-member.dto';
import { UpdateGroupMemberDto } from '../../application/commands/update-group-member/update-group-member.dto';
import { FindGroupMemberDto } from '../../application/queries/find-group-member/find-group-member.dto';
import { GroupMember } from '../../domain/entities/group-member';
import {
  StandardGroupMember,
  StandardGroupMemberBase,
} from '../../domain/entities/standard-group-member';
import { GroupMemberStatus } from '../../domain/value-objects/group-member-status';
import { GroupMemberType } from '../../domain/value-objects/group-member-type';
import {
  StandardGroupMemberBaseResponseDto,
  StandardGroupMemberResponseDto,
} from '../../infra/dto/standard-group-member.response.dto';
import { UpsertCourseGroupMemberRequestDto } from '../../infra/upsert-course-group-member/dto/upsert-course-group-member.request.dto';
import config from '../../static/config';
import { GroupBuilder } from './group.builder';
import { CourseGroupMember } from '../../domain/entities/course-group-member';
import {
  CourseGroupMemberBaseResponseDto,
  CourseGroupMemberResponseDto,
} from '../../infra/dto/course-group-member.response.dto';
import { MemberBuilder } from './member.builder';
import { Member } from '../../domain/entities/member';
import { MemberResponseDto } from '@curioushuman/cc-members-service';
import { UpdateGroupMemberRequestDto } from '../../infra/update-group-member/dto/update-group-member.request.dto';

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
    id: '6fce9d10-aeed-4bb1-8c8c-92094f1984ff',
    memberId: 'bd4dfd87-70c1-4a6f-b590-b3bbfce99f51',
    groupId: '5aad9387-2bfb-4391-82b3-8501a4fca58e',

    status: 'pending' as GroupMemberStatus,
    accountOwner: config.defaults.accountOwner,
  };
  const overrides: GroupMemberLooseMimic = {
    _type: defaultProperties._type,
    id: defaultProperties.id,
    memberId: defaultProperties.memberId,
    groupId: defaultProperties.groupId,

    status: defaultProperties.status,
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
    alpha() {
      overrides.id = '039b8745-7e57-4ec5-a68c-2522fac48d03';
      return this;
    },

    beta() {
      overrides.id = '039b8745-7e57-4ec5-a68c-2522fac48d03';
      return this;
    },

    noSourceExists() {
      // we have no real manner of distinguishing at this level
      // it all comes down to relationships
      // handled below
      // TODO: is there a better way?
      return this;
    },

    noMatchingSource() {
      // we have no real manner of distinguishing at this level
      // it all comes down to relationships
      // handled below
      // TODO: is there a better way?
      return this;
    },

    invalid() {
      // we have no real manner of distinguishing at this level
      // it all comes down to relationships
      // handled below
      // TODO: is there a better way?
      overrides.id = 'ed3f9919-cd1e-4e8d-8829-64a833858567';
      overrides.status = '';
      return this;
    },

    invalidOther() {
      overrides.groupId = '';
      overrides.id = '1e72ef98-f21e-4e0a-aff1-a45ed7328456';
      overrides.status = '';
      return this;
    },

    exists() {
      // pop the default one in
      return this;
    },

    existsAlpha() {
      overrides.id = 'a54f148b-438e-47a1-a7ed-0c408387a688';
      return this;
    },

    updated() {
      overrides.id = '2f829239-b878-468c-80b0-8a0d3dfae027';
      overrides.status = 'active';
      return this;
    },

    updatedAlpha() {
      overrides.id = '88d9b47c-75dc-4be8-b2ee-93e578510399';
      overrides.status = 'active';
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
    build(m?: Member): StandardGroupMember {
      return this.buildNoCheck(m);
    },

    buildNoCheck(m?: Member): StandardGroupMember {
      const groupMemberBase = {
        ...defaultProperties,
        ...overrides,
      };
      const group = GroupBuilder().exists().buildBaseNoCheck();
      const member = m || MemberBuilder().build();
      return {
        ...groupMemberBase,
        group,
        member,
      } as StandardGroupMember;
    },

    buildCourseGroupMember(m?: Member): CourseGroupMember {
      return this.buildCourseGroupMemberNoCheck(m);
    },

    buildCourseGroupMemberNoCheck(m?: Member): CourseGroupMember {
      const groupMemberBase = {
        ...defaultProperties,
        ...overrides,
        ...courseGroupMemberOverrides,
      };
      const group = GroupBuilder().existsCourse().buildCourseGroupBaseNoCheck();
      const member = m || MemberBuilder().build();
      // the above checks are sufficient
      return {
        ...groupMemberBase,
        group,
        member,
      } as CourseGroupMember;
    },

    buildFindByMemberIdGroupMemberDto(m?: Member): FindGroupMemberDto {
      const groupMember = this.exists().buildNoCheck();
      const member = m || MemberBuilder().exists().build();
      return {
        identifier: 'memberId',
        value: member.id,
        parentId: groupMember.groupId,
      } as FindGroupMemberDto;
    },

    buildFindByParticipantIdGroupMemberDto(): FindGroupMemberDto {
      const groupMember = this.existsAlpha().buildCourseGroupMemberNoCheck();
      return {
        identifier: 'participantId',
        value: groupMember.participantId,
        parentId: 'b2b28292-563b-4f3c-8df4-995470b46275',
      } as FindGroupMemberDto;
    },

    // buildCreateGroupMemberDto(gms?: GroupMemberSource): CreateGroupMemberDto {
    //   // default is successful path
    //   const groupMemberSource =
    //     gms || GroupMemberSourceBuilder().beta().buildNoCheck();
    //     // not ideal but...
    //     groupMemberSource.memberId = MemberBuilder().beta().build().id;

    //   return { groupMemberSource } as CreateGroupMemberDto;
    // },

    buildCreateCourseGroupMemberDto(): CreateGroupMemberDto {
      const build = this.doesntExist().buildCourseGroupMemberNoCheck();
      const group = GroupBuilder().existsCourse().buildCourseGroupBaseNoCheck();
      const member = MemberBuilder().alpha().buildDto();
      return {
        group,
        participant: {
          id: 'f21cd3d7-a7a9-471b-929a-8180c7dd2368',
          memberId: build.memberId,
          courseId: group.courseId,
          status: build.status,
          accountOwner: build.accountOwner,
          member,
        },
      } as CreateGroupMemberDto;
    },

    buildCreateCourseGroupMemberRequestDto(): UpsertCourseGroupMemberRequestDto {
      const build = this.doesntExist().buildCourseGroupMemberNoCheck();
      const group = GroupBuilder().existsCourse().buildCourseGroupBaseNoCheck();
      const member = MemberBuilder().beta().buildDto();
      return {
        participant: {
          id: 'f21cd3d7-a7a9-471b-929a-8180c7dd2368',
          memberId: build.memberId,
          courseId: group.courseId,
          status: build.status,
          accountOwner: build.accountOwner,
          member,
        },
      } as UpsertCourseGroupMemberRequestDto;
    },

    // buildUpdateGroupMemberDto(gms?: GroupMemberSource): UpdateGroupMemberDto {
    //   // default is successful path
    //   const groupMemberSource =
    //     gms || GroupMemberSourceBuilder().updated().buildNoCheck();
    //   const groupMember = this.buildNoCheck();
    //   return { groupMemberSource, groupMember } as UpdateGroupMemberDto;
    // },

    buildUpdateCourseGroupMemberDto(): UpdateGroupMemberDto {
      const member = MemberBuilder().exists().build();
      const groupMember = this.buildCourseGroupMemberNoCheck(member);
      const group = GroupBuilder().existsCourse().buildCourseGroupBaseNoCheck();
      const memberDto = MemberBuilder().exists().buildDto();
      return {
        groupMember,
        participant: {
          id: groupMember.participantId,
          memberId: groupMember.memberId,
          courseId: group.courseId,
          status: groupMember.status,
          accountOwner: groupMember.accountOwner,
          member: memberDto,
        },
      } as UpdateGroupMemberDto;
    },

    buildUpsertUpdateCourseGroupMemberRequestDto(): UpsertCourseGroupMemberRequestDto {
      const member = MemberBuilder().exists().build();
      const memberDto = MemberBuilder().exists().buildDto();
      const groupMember = this.buildCourseGroupMemberNoCheck(member);
      const group = GroupBuilder().existsCourse().buildCourseGroupBaseNoCheck();
      return {
        participant: {
          id: groupMember.participantId,
          memberId: groupMember.memberId,
          courseId: group.courseId,
          status: groupMember.status,
          accountOwner: groupMember.accountOwner,
          member: memberDto,
        },
      } as UpsertCourseGroupMemberRequestDto;
    },

    buildUpdateGroupMemberRequestDto(
      m?: MemberResponseDto
    ): UpdateGroupMemberRequestDto {
      const memberDto = m || MemberBuilder().updated().buildDto();
      const groupMember = this.buildGroupMemberResponseDto(memberDto);
      return {
        groupMember,
      } as UpdateGroupMemberRequestDto;
    },

    buildGroupMemberBaseResponseDto(): StandardGroupMemberBaseResponseDto {
      const dto = {
        ...defaultProperties,
        ...overrides,
      };
      delete dto.group;
      delete dto.member;
      return dto as StandardGroupMemberBaseResponseDto;
    },

    buildGroupMemberResponseDto(
      m?: MemberResponseDto
    ): StandardGroupMemberResponseDto {
      const group = GroupBuilder().exists().buildGroupBaseResponseDto();
      const member = m || MemberBuilder().exists().buildDto();
      const dto = {
        ...defaultProperties,
        ...overrides,
        group,
        member,
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
      delete dto.member;
      return dto as CourseGroupMemberBaseResponseDto;
    },

    buildCourseGroupMemberResponseDto(
      m?: MemberResponseDto
    ): CourseGroupMemberResponseDto {
      const group = GroupBuilder()
        .existsCourse()
        .buildCourseGroupBaseResponseDto();
      const member = m || MemberBuilder().exists().buildDto();
      const dto = {
        ...defaultProperties,
        ...overrides,
        ...courseGroupMemberOverrides,
        sourceIds: [],
        group,
        member,
      };
      return dto as CourseGroupMemberResponseDto;
    },
  };
};
