import { CourseResponseDto } from './dto/course.response.dto';
import { Course } from '../domain/entities/course';

/**
 * TODO
 * - Should we do more checking of CourseResponseDto?
 */
export class CoursesMapper {
  public static toResponseDto(course: Course): CourseResponseDto {
    return {
      id: course.id,
      name: course.name,
      slug: course.slug,
      details: course.details,
      dateTrackMinimum: course.dateTrackMinimum,
      dateOpen: course.dateOpen,
      dateClosed: course.dateClosed,
      yearMonthOpen: course.yearMonthOpen,
      countEntries: course.countEntries,
      countEntriesUnmoderated: course.countEntriesUnmoderated,
      countEntriesModerated: course.countEntriesModerated,
      countResultsLongList: course.countResultsLongList,
      countResultsShortList: course.countResultsShortList,
      countResultsFinalists: course.countResultsFinalists,
      countResultsWinners: course.countResultsWinners,
    } as CourseResponseDto;
  }
}
