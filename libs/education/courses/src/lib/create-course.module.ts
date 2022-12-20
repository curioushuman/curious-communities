import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { CourseRepository } from './adapter/ports/course.repository';
import { FakeCourseRepository } from './adapter/implementations/fake/fake.course.repository';
import { CreateCourseHandler } from './application/commands/create-course/create-course.command';
import { CreateCourseController } from './infra/create-course/create-course.controller';
import { CourseSourceRepository } from './adapter/ports/course-source.repository';
import { FakeCourseSourceRepository } from './adapter/implementations/fake/fake.course-source.repository';

const controllers = [CreateCourseController];

const handlers = [CreateCourseHandler];

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
export class CreateCourseModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
