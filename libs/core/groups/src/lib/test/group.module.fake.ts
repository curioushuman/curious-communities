import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

import { GroupRepository } from '../adapter/ports/group.repository';
import { FakeGroupRepository } from '../adapter/implementations/fake/fake.group.repository';
import {
  GroupSourceCommunityRepository,
  GroupSourceMicroCourseRepository,
} from '../adapter/ports/group-source.repository';
import { FakeGroupSourceCommunityRepository } from '../adapter/implementations/fake/fake.group-source.community.repository';
import { FakeGroupSourceMicroCourseRepository } from '../adapter/implementations/fake/fake.group-source.micro-course.repository';
import { UpsertGroupSourceController } from '../infra/upsert-group-source/upsert-group-source.controller';
import { CreateGroupSourceHandler } from '../application/commands/create-group-source/create-group-source.command';
import { UpdateGroupSourceHandler } from '../application/commands/update-group-source/update-group-source.command';
import { FindGroupSourceHandler } from '../application/queries/find-group-source/find-group-source.query';

const controllers = [UpsertGroupSourceController];

const handlers = [
  CreateGroupSourceHandler,
  FindGroupSourceHandler,
  UpdateGroupSourceHandler,
];

const repositories = [
  { provide: GroupRepository, useClass: FakeGroupRepository },
  {
    provide: GroupSourceCommunityRepository,
    useClass: FakeGroupSourceCommunityRepository,
  },
  {
    provide: GroupSourceMicroCourseRepository,
    useClass: FakeGroupSourceMicroCourseRepository,
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
export class GroupModule {}
