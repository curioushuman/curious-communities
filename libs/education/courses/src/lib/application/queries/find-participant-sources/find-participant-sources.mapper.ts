import { findSourceId } from '@curioushuman/common';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';
import { CourseMapper } from '../../../infra/course.mapper';
import { UpsertParticipantMultiRequestDto } from '../../../infra/upsert-participant-multi/dto/upsert-participant-multi.request.dto';
import config from '../../../static/config';
import { FindParticipantSourcesDto } from './find-participant-sources.dto';

export class FindParticipantSourcesMapper {
  public static fromUpsertParticipantMultiRequestDto(
    dto: UpsertParticipantMultiRequestDto
  ): FindParticipantSourcesDto {
    const course = CourseMapper.fromResponseDtoToBase(dto.course);
    const source = course.sourceOrigin || config.defaults.primaryAccountSource;
    const sourceId = findSourceId(course.sourceIds, source);
    if (!sourceId) {
      throw new InternalRequestInvalidError(
        'No matching source ID found on course'
      );
    }
    return {
      parentId: CourseSourceId.check(sourceId.id),
    };
  }
}
