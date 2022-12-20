import { TaskEither } from 'fp-ts/lib/TaskEither';

import { CourseSource } from '../../domain/entities/course-source';
import { FindCourseSourceDto } from '../../application/queries/find-course-source/find-course-source.dto';

export abstract class CourseSourceRepository {
  abstract findOne(dto: FindCourseSourceDto): TaskEither<Error, CourseSource>;
}
