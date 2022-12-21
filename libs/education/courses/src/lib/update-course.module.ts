import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { CourseRepository } from './adapter/ports/course.repository';
import { FakeCourseRepository } from './adapter/implementations/fake/fake.course.repository';
import { UpdateCourseHandler } from './application/commands/update-course/update-course.command';
import { UpdateCourseController } from './infra/update-course/update-course.controller';
import { CourseSourceRepository } from './adapter/ports/course-source.repository';
import { FakeCourseSourceRepository } from './adapter/implementations/fake/fake.course-source.repository';

const controllers = [UpdateCourseController];

const handlers = [UpdateCourseHandler];

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
    provide: ErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
];

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class UpdateCourseModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
