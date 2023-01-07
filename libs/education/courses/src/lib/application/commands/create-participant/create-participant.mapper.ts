import { CreateParticipantDto } from './create-participant.dto';
import { CreateParticipantRequestDto } from '../../../infra/create-participant/dto/create-participant.request.dto';
import { ParticipantSourceForCreate } from '../../../domain/entities/participant-source';
import {
  Participant,
  ParticipantFromSource,
  ParticipantFromSourceAndCourse,
} from '../../../domain/entities/participant';
import { CourseForCreate } from '../../../domain/entities/course';
import { createParticipantId } from '../../../domain/value-objects/participant-id';
import config from '../../../static/config';
import { MemberForCreate } from '../../../domain/entities/member';

/**
 * TODO
 * - create base abstract class for mappers
 */
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
    source: ParticipantSourceForCreate
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
    course: CourseForCreate
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
    member: MemberForCreate
  ): (participant: ParticipantFromSourceAndCourse) => Participant {
    return (participant: ParticipantFromSourceAndCourse) => {
      return Participant.check({
        ...participant,

        memberId: member.id,
        memberName: member.name,
        memberEmail: member.email,
        memberOrganisationName: member.organisationName,
      });
    };
  }
}
