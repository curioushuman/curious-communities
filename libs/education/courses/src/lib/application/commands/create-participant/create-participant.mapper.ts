import { CreateParticipantDto } from './create-participant.dto';
import { CreateParticipantRequestDto } from '../../../infra/create-participant/dto/create-participant.request.dto';
import {
  Participant,
  ParticipantFromSource,
  ParticipantFromSourceAndMember,
} from '../../../domain/entities/participant';
import { createParticipantId } from '../../../domain/value-objects/participant-id';
import config from '../../../static/config';
import { CourseBase } from '../../../domain/entities/course';
import { ParticipantSource } from '../../../domain/entities/participant-source';
import { ParticipantSourceMapper } from '../../../infra/participant-source.mapper';
import { CourseMapper } from '../../../infra/course.mapper';
import { AccountSlug } from '../../../domain/value-objects/account-slug';
import { Member } from '../../../domain/entities/member';
import { MemberMapper } from '../../../infra/member.mapper';
import { ParticipantMapper } from '../../../domain/mappers/participant.mapper';

export class CreateParticipantMapper {
  public static fromRequestDto(
    dto: CreateParticipantRequestDto
  ): CreateParticipantDto {
    return {
      participantSource: ParticipantSourceMapper.fromResponseDto(
        dto.participantSource
      ),
      course: CourseMapper.fromResponseDtoToBase(dto.course),
      member: MemberMapper.fromResponseDto(dto.member),
    };
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
      status: ParticipantMapper.fromSourceStatus(source.status),
      sourceOrigin: source.source,
      sourceIds: [
        {
          id: source.id,
          source: source.source,
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
    member: Member
  ): (participant: ParticipantFromSource) => ParticipantFromSourceAndMember {
    return (participant: ParticipantFromSource) => {
      return {
        ...participant,
        memberId: member.id,
        member,
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
      const course = CourseBase.check(courseBase);
      return {
        ...participant,
        courseId: courseBase.id,
        course,
      };
    };
  }
}
