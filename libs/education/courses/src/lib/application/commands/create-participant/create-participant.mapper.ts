import { CreateParticipantDto } from './create-participant.dto';
import { CreateParticipantRequestDto } from '../../../infra/create-participant/dto/create-participant.request.dto';
import {
  Participant,
  ParticipantFromSource,
  ParticipantFromSourceAndCourse,
} from '../../../domain/entities/participant';
import { createParticipantId } from '../../../domain/value-objects/participant-id';
import config from '../../../static/config';
import { MemberDto } from '../../../infra/dto/member.dto';
import { ParticipantSourceDto } from '../../../infra/dto/participant-source.dto';
import { CourseDto } from '../../../infra/dto/course.dto';

export class CreateParticipantMapper {
  public static fromRequestDto(
    dto: CreateParticipantRequestDto
  ): CreateParticipantDto {
    return CreateParticipantDto.check({
      participantSource: dto.participantSource,
      course: dto.course,
      member: dto.member,
    });
  }

  /**
   * We grab the basic information from the source
   * AND we'll fill in any defaults while we're at it
   */
  public static fromSourceToParticipant(
    source: ParticipantSourceDto
  ): ParticipantFromSource {
    return ParticipantFromSource.check({
      id: createParticipantId(),
      status: source.status,
      sourceIds: [
        {
          id: source.id,
          source: config.defaults.primaryAccountSource,
        },
      ],
      accountOwner: config.defaults.accountOwner,
    });
  }

  /**
   * We build on the info from the source
   * And grab any relevant info from the course
   */
  public static fromCourseToParticipant(
    course: CourseDto
  ): (participant: ParticipantFromSource) => ParticipantFromSourceAndCourse {
    return (participant: ParticipantFromSource) => {
      return ParticipantFromSourceAndCourse.check({
        ...participant,

        courseId: course.id,
      });
    };
  }

  /**
   * Same deal, we build on what we have, and then grab the member info
   */
  public static fromMemberToParticipant(
    member: MemberDto
  ): (participant: ParticipantFromSourceAndCourse) => Participant {
    return (participant: ParticipantFromSourceAndCourse) => {
      return Participant.check({
        ...participant,

        memberId: member.id,
        name: member.name,
        email: member.email,
        organisationName: member.organisationName,
      });
    };
  }
}
