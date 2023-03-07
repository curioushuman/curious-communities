import { prepareExternalIdSourceValue } from '@curioushuman/common';

import {
  ParticipantBaseResponseDto,
  ParticipantResponseDto,
} from './dto/participant.response.dto';
import {
  Participant,
  ParticipantBase,
  prepareParticipantExternalIdSource,
} from '../domain/entities/participant';
import { ParticipantSourceIdSource } from '../domain/value-objects/participant-source-id-source';
import { CourseMapper } from './course.mapper';
import { MemberMapper } from './member.mapper';

export class ParticipantMapper {
  public static toResponseDtoIdSource(idSource: ParticipantSourceIdSource) {
    return prepareExternalIdSourceValue(idSource.id, idSource.source);
  }

  public static toResponseDto(
    participant: Participant
  ): ParticipantResponseDto {
    const baseDto: ParticipantBaseResponseDto =
      ParticipantMapper.toBaseResponseDto(participant);
    const dto = {
      ...baseDto,
      course: CourseMapper.toBaseResponseDto(participant.course),
      member: MemberMapper.toResponseDto(participant.member),
    };
    return dto;
  }

  public static toBaseResponseDto(
    participant: Participant | ParticipantBase
  ): ParticipantBaseResponseDto {
    const dto: ParticipantBaseResponseDto = {
      id: participant.id,
      memberId: participant.memberId,
      courseId: participant.courseId,
      status: participant.status,
      sourceOrigin: participant.sourceOrigin,
      sourceIds: participant.sourceIds.map(
        ParticipantMapper.toResponseDtoIdSource
      ),

      accountOwner: participant.accountOwner,
    };
    return ParticipantBaseResponseDto.check(dto);
  }

  public static fromResponseDto(dto: ParticipantResponseDto): Participant {
    const base: ParticipantBase = ParticipantMapper.fromResponseDtoToBase(dto);
    return {
      ...base,
      course: CourseMapper.fromResponseDtoToBase(dto.course),
      member: MemberMapper.fromResponseDto(dto.member),
    };
  }

  public static fromResponseDtoToBase(
    dto: ParticipantResponseDto | ParticipantBaseResponseDto
  ): ParticipantBase {
    const participant = {
      id: dto.id,
      status: dto.status,
      memberId: dto.memberId,
      courseId: dto.courseId,
      sourceOrigin: dto.sourceOrigin,
      sourceIds: dto.sourceIds.map(prepareParticipantExternalIdSource),

      accountOwner: dto.accountOwner,
    };
    return ParticipantBase.check(participant);
  }
}
