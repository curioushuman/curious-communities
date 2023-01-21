import { CreateParticipantDto } from './create-participant.dto';
import { CreateParticipantRequestDto } from '../../../infra/create-participant/dto/create-participant.request.dto';
import {
  Participant,
  ParticipantBase,
  ParticipantFromSource,
  ParticipantFromSourceAndMember,
} from '../../../domain/entities/participant';
import { createParticipantId } from '../../../domain/value-objects/participant-id';
import config from '../../../static/config';
import { MemberDto } from '../../../infra/dto/member.dto';
import { CourseBase } from '../../../domain/entities/course';
import { ParticipantSource } from '../../../domain/entities/participant-source';
import { ParticipantSourceMapper } from '../../../infra/participant-source.mapper';
import { CourseMapper } from '../../../infra/course.mapper';
import { ParticipantStatus } from '../../../domain/value-objects/participant-status';
import { AccountSlug } from '../../../domain/value-objects/account-slug';

export class CreateParticipantMapper {
  public static fromRequestDto(
    dto: CreateParticipantRequestDto
  ): CreateParticipantDto {
    return CreateParticipantDto.check({
      participantSource: ParticipantSourceMapper.fromResponseDto(
        dto.participantSource
      ),
      course: CourseMapper.fromResponseDtoToBase(dto.course),
      member: dto.member,
    });
  }

  /**
   * We grab the basic information from the source
   * AND we'll fill in any defaults while we're at it
   *
   * NOTE: we are not using runtype checking here. See
   * notes near ParticipantFromSource for more info.
   */
  public static fromSourceToParticipant(
    source: ParticipantSource
  ): ParticipantFromSource {
    const participantFromSource = {
      id: createParticipantId(),
      status: source.status as ParticipantStatus,
      sourceIds: [
        {
          id: source.id,
          source: config.defaults.primaryAccountSource,
        },
      ],
      accountOwner: config.defaults.accountOwner as AccountSlug,
    };
    return participantFromSource as ParticipantFromSource;
    // return ParticipantFromSource.check(participantFromSource);
  }

  /**
   * We build on the info from the source
   * And grab any relevant info from the member
   *
   * NOTE: we are not using runtype checking here. See
   * notes near ParticipantFromSource for more info.
   */
  public static fromMemberToParticipant(
    member: MemberDto
  ): (participant: ParticipantFromSource) => ParticipantFromSourceAndMember {
    return (participant: ParticipantFromSource) => {
      return {
        ...participant,

        memberId: member.id,
        name: member.name,
        email: member.email,
        organisationName: member.organisationName,
      } as ParticipantFromSourceAndMember;
    };
  }

  /**
   * We build on the info from the source
   * And grab any relevant info from the course
   *
   * NOTE: THIS is where we do runtype checking
   */
  public static fromCourseToParticipant(
    courseBase: CourseBase
  ): (participant: ParticipantFromSourceAndMember) => Participant {
    return (participant: ParticipantFromSourceAndMember) => {
      const participantBase = ParticipantBase.check({
        ...participant,
        courseId: courseBase.id,
      });
      const course = CourseBase.check(courseBase);
      return {
        ...participantBase,
        course,
      };
    };
  }
}
