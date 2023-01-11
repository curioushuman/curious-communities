import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { CourseGroupRepository } from './adapter/ports/course-group.repository';
import { FakeCourseGroupRepository } from './adapter/implementations/fake/fake.course-group.repository';
import { CreateCourseGroupHandler } from './application/commands/create-course-group/create-course-group.command';
import { CreateCourseGroupController } from './infra/create-course-group/create-course-group.controller';
import { UpdateCourseGroupHandler } from './application/commands/update-course-group/update-course-group.command';
import { UpdateCourseGroupController } from './infra/update-course-group/update-course-group.controller';

const controllers = [UpdateCourseGroupController, CreateCourseGroupController];

const handlers = [UpdateCourseGroupHandler, CreateCourseGroupHandler];

const repositories = [
  {
    provide: CourseGroupRepository,
    useClass: FakeCourseGroupRepository,
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
export class MutateCourseGroupModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
