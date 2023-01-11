import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

import { CourseGroupRepository } from '../adapter/ports/course-group.repository';
import { FakeCourseGroupRepository } from '../adapter/implementations/fake/fake.course-group.repository';
import { CreateCourseGroupController } from '../infra/create-course-group/create-course-group.controller';
import { CreateCourseGroupHandler } from '../application/commands/create-course-group/create-course-group.command';
import { UpdateCourseGroupController } from '../infra/update-course-group/update-course-group.controller';
import { UpdateCourseGroupHandler } from '../application/commands/update-course-group/update-course-group.command';

const controllers = [CreateCourseGroupController, UpdateCourseGroupController];

const handlers = [CreateCourseGroupHandler, UpdateCourseGroupHandler];

const repositories = [
  { provide: CourseGroupRepository, useClass: FakeCourseGroupRepository },
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
export class CourseGroupModule {}
