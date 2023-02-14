import { Null, Optional, Record, Static } from 'runtypes';
import { GroupSource } from '../../../domain/entities/group-source';
import { CourseDto } from '../../../domain/entities/course.dto';

/**
 * This is the form of data our repository will expect for the command
 *
 * It happens to re-use the GroupSourceIdSource type, but this is not
 * required. It is just a convenience.
 *
 * TODO:
 * - [ ] there is a case to be made that CourseDto should have better validation
 *       i.e. CourseDto as an incoming response could be Strings...
 *       But, out pattern is, by this stage we should be ensuring it conforms to the correct shape
 */

export const CreateGroupDto = Record({
  course: Optional(CourseDto.Or(Null)),
  groupSource: Optional(GroupSource.Or(Null)),
}).withConstraint((dto) => !!(dto.course || dto.groupSource));

export type CreateGroupDto = Static<typeof CreateGroupDto>;
