import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

import { GroupMemberRepository } from '../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../adapter/implementations/fake/fake.group-member.repository';
import {
  GroupMemberSourceCommunityRepository,
  GroupMemberSourceMicroCourseRepository,
} from '../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceCommunityRepository } from '../adapter/implementations/fake/fake.group-member-source.community.repository';
import { FakeGroupMemberSourceMicroCourseRepository } from '../adapter/implementations/fake/fake.group-member-source.micro-course.repository';
import { UpsertGroupMemberSourceController } from '../infra/upsert-group-member-source/upsert-group-member-source.controller';
import { CreateGroupMemberSourceHandler } from '../application/commands/create-group-member-source/create-group-member-source.command';
import { UpdateGroupMemberSourceHandler } from '../application/commands/update-group-member-source/update-group-member-source.command';
import { FindGroupMemberSourceHandler } from '../application/queries/find-group-member-source/find-group-member-source.query';

const controllers = [UpsertGroupMemberSourceController];

const handlers = [
  CreateGroupMemberSourceHandler,
  FindGroupMemberSourceHandler,
  UpdateGroupMemberSourceHandler,
];

const repositories = [
  { provide: GroupMemberRepository, useClass: FakeGroupMemberRepository },
  {
    provide: GroupMemberSourceCommunityRepository,
    useClass: FakeGroupMemberSourceCommunityRepository,
  },
  {
    provide: GroupMemberSourceMicroCourseRepository,
    useClass: FakeGroupMemberSourceMicroCourseRepository,
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
export class GroupMemberModule {}
