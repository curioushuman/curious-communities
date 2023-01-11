import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { FindGroupMemberSourceHandler } from './application/queries/find-group-member-source/find-group-member-source.query';
import { UpdateGroupMemberSourceHandler } from './application/commands/update-group-member-source/update-group-member-source.command';
import { CreateGroupMemberSourceHandler } from './application/commands/create-group-member-source/create-group-member-source.command';
import { UpsertGroupMemberSourceController } from './infra/upsert-group-member-source/upsert-group-member-source.controller';
import {
  GroupMemberSourceCommunityRepository,
  GroupMemberSourceMicroCourseRepository,
} from './adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceCommunityRepository } from './adapter/implementations/fake/fake.group-member-source.community.repository';
import { FakeGroupMemberSourceMicroCourseRepository } from './adapter/implementations/fake/fake.group-member-source.micro-course.repository';
import { GroupMemberRepository } from './adapter/ports/group-member.repository';
import { FakeGroupMemberSourceRepository } from './adapter/implementations/fake/fake.group-member-source.repository';

const controllers = [UpsertGroupMemberSourceController];

const handlers = [
  CreateGroupMemberSourceHandler,
  FindGroupMemberSourceHandler,
  UpdateGroupMemberSourceHandler,
];

/**
 * This is the list of possible source repositories
 *
 * TODO
 * - [ ] see if you can use one of the Nest layers in the module
 *       below to dynamically load only the source repository that
 *       is required.
 *       OR consider it at a higher level?
 *       OR just leave it where it is
 */
const repositories = [
  { provide: GroupMemberRepository, useClass: FakeGroupMemberSourceRepository },
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
export class UpsertGroupMemberSourceModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
