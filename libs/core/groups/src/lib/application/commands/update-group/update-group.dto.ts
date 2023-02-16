import { Null, Optional, Record, Static } from 'runtypes';
import { GroupBase } from '../../../domain/entities/group';
import { GroupSource } from '../../../domain/entities/group-source';
import { CourseDto } from '../../../infra/dto/course.dto';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateGroupDto = Record({
  group: GroupBase,
  course: Optional(CourseDto.Or(Null)),
  groupSource: Optional(GroupSource.Or(Null)),
}).withConstraint((dto) => !!(dto.course || dto.groupSource));

export type UpdateGroupDto = Static<typeof UpdateGroupDto>;
