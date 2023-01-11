import { Static, String } from 'runtypes';
import { GroupBaseResponseDto, GroupResponseDto } from './group.response.dto';

/**
 * The base structure of CourseGroup data we will pass between our applications
 */
export const CourseGroupBaseResponseDto = GroupBaseResponseDto.extend({
  courseId: String,
});

/**
 * The base structure of CourseGroup data we will pass between our applications
 */
export type CourseGroupBaseResponseDto = Static<
  typeof CourseGroupBaseResponseDto
>;

/**
 * The structure of CourseGroup data we will pass between our applications
 */
export const CourseGroupResponseDto = GroupResponseDto.extend({
  courseId: String,
});

/**
 * The structure of CourseGroup data we will pass between our applications
 */
export type CourseGroupResponseDto = Static<typeof CourseGroupResponseDto>;
