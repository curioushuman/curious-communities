import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FakeRepositoryErrorFactory } from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { CourseRepository } from '../adapter/ports/course.repository';
import { FakeCourseRepository } from '../adapter/implementations/fake/fake.course.repository';
import { CourseSourceRepository } from '../adapter/ports/course-source.repository';
import { FakeCourseSourceRepository } from '../adapter/implementations/fake/fake.course-source.repository';
import { CreateCourseController } from '../infra/create-course/create-course.controller';
import { CreateCourseHandler } from '../application/commands/create-course/create-course.command';
import { UpdateCourseController } from '../infra/update-course/update-course.controller';
import { UpdateCourseHandler } from '../application/commands/update-course/update-course.command';
import { FindCourseController } from '../infra/find-course/find-course.controller';
import { FindCourseHandler } from '../application/queries/find-course/find-course.query';
import { CourseSourceRepositoryErrorFactory } from '../adapter/ports/course-source.repository.error-factory';
import { CourseRepositoryErrorFactory } from '../adapter/ports/course.repository.error-factory';
import { FindCourseSourceHandler } from '../application/queries/find-course-source/find-course-source.query';

const controllers = [
  CreateCourseController,
  UpdateCourseController,
  FindCourseController,
];

const handlers = [
  CreateCourseHandler,
  UpdateCourseHandler,
  FindCourseHandler,
  FindCourseSourceHandler,
];

const repositories = [
  {
    provide: CourseRepository,
    useClass: FakeCourseRepository,
  },
  {
    provide: CourseSourceRepository,
    useClass: FakeCourseSourceRepository,
  },
];

const services = [
  {
    provide: CourseRepositoryErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
  {
    provide: CourseSourceRepositoryErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
];

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class CourseModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
