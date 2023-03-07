import {
  createYearMonth,
  prepareExternalIdSourceValue,
  Timestamp,
} from '@curioushuman/common';

import {
  CourseBaseResponseDto,
  CourseResponseDto,
} from './dto/course.response.dto';
import {
  Course,
  CourseBase,
  prepareCourseExternalIdSource,
} from '../domain/entities/course';
import { ParticipantMapper } from './participant.mapper';
import { CourseSourceIdSource } from '../domain/value-objects/course-source-id-source';

export class CourseMapper {
  public static toResponseDtoIdSource(idSource: CourseSourceIdSource) {
    return prepareExternalIdSourceValue(idSource.id, idSource.source);
  }

  public static toResponseDto(course: Course): CourseResponseDto {
    const dto: CourseBaseResponseDto = CourseMapper.toBaseResponseDto(course);
    return CourseResponseDto.check({
      ...dto,
      participants: course.participants.map(
        ParticipantMapper.toBaseResponseDto
      ),
    });
  }

  public static toBaseResponseDto(
    course: Course | CourseBase
  ): CourseBaseResponseDto {
    const dto: CourseBaseResponseDto = {
      id: course.id,
      slug: course.slug,
      status: course.status,
      sourceOrigin: course.sourceOrigin,
      sourceIds: course.sourceIds.map(CourseMapper.toResponseDtoIdSource),

      supportType: course.supportType,
      name: course.name,
      dateOpen: course.dateOpen,
      dateClosed: course.dateClosed,
      yearMonthOpen: course.yearMonthOpen,

      accountOwner: course.accountOwner,
    };
    return CourseBaseResponseDto.check(dto);
  }

  public static fromResponseDto(dto: CourseResponseDto): Course {
    const base: CourseBase = CourseMapper.fromResponseDtoToBase(dto);
    const course = {
      ...base,
      participants: dto.participants.map((member) =>
        ParticipantMapper.fromResponseDtoToBase(member)
      ),
    };
    return Course.check(course);
  }

  public static fromResponseDtoToBase(
    dto: CourseResponseDto | CourseBaseResponseDto
  ): CourseBase {
    const yearMonthOpen = dto.dateOpen
      ? createYearMonth(Timestamp.check(dto.dateOpen))
      : undefined;
    const course = {
      id: dto.id,
      slug: dto.slug,
      status: dto.status,
      supportType: dto.supportType,
      sourceOrigin: dto.sourceOrigin,
      sourceIds: dto.sourceIds.map(prepareCourseExternalIdSource),

      name: dto.name,
      dateOpen: dto.dateOpen,
      dateClosed: dto.dateClosed,
      yearMonthOpen: dto.yearMonthOpen || yearMonthOpen,

      accountOwner: dto.accountOwner,
    };
    return CourseBase.check(course);
  }
}
