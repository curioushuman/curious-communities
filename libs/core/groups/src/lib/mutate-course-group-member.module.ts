import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { CreateCourseGroupMemberHandler } from './application/commands/create-course-group-member/create-course-group-member.command';
import { CreateCourseGroupMemberController } from './infra/create-course-group-member/create-course-group-member.controller';
import { FindCourseGroupHandler } from './application/queries/find-course-group/find-course-group.query';
import { CourseGroupRepository } from './adapter/ports/course-group.repository';
import { FakeCourseGroupRepository } from './adapter/implementations/fake/fake.course-group.repository';
import { UpdateCourseGroupMemberHandler } from './application/commands/update-course-group-member/update-course-group-member.command';
import { UpdateCourseGroupMemberController } from './infra/update-course-group-member/update-course-group-member.controller';
import { GroupMemberRepository } from './adapter/ports/group-member.repository';
import { FakeGroupMemberSourceRepository } from './adapter/implementations/fake/fake.group-member-source.repository';

const controllers = [
  CreateCourseGroupMemberController,
  UpdateCourseGroupMemberController,
];

const handlers = [
  UpdateCourseGroupMemberHandler,
  FindCourseGroupHandler,
  CreateCourseGroupMemberHandler,
];

const repositories = [
  { provide: GroupMemberRepository, useClass: FakeGroupMemberSourceRepository },
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
export class MutateCourseGroupMemberModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
