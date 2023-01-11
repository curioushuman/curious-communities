import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

import { GroupMemberRepository } from '../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../adapter/implementations/fake/fake.group-member.repository';
import { CreateCourseGroupMemberController } from '../infra/create-course-group-member/create-course-group-member.controller';
import { UpdateCourseGroupMemberController } from '../infra/update-course-group-member/update-course-group-member.controller';
import { CreateCourseGroupMemberHandler } from '../application/commands/create-course-group-member/create-course-group-member.command';
import { FindCourseGroupHandler } from '../application/queries/find-course-group/find-course-group.query';
import { CourseGroupRepository } from '../adapter/ports/course-group.repository';
import { FakeCourseGroupRepository } from '../adapter/implementations/fake/fake.course-group.repository';
import { UpdateCourseGroupMemberHandler } from '../application/commands/update-course-group-member/update-course-group-member.command';

const controllers = [
  CreateCourseGroupMemberController,
  UpdateCourseGroupMemberController,
];

const handlers = [
  CreateCourseGroupMemberHandler,
  FindCourseGroupHandler,
  UpdateCourseGroupMemberHandler,
];

const repositories = [
  { provide: GroupMemberRepository, useClass: FakeGroupMemberRepository },
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
  providers: [...repositories, ...handlers, ...services],
  exports: [],
})
export class CourseGroupMemberModule {}
