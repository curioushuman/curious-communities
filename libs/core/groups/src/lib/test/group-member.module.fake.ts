import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FakeRepositoryErrorFactory } from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { GroupMemberRepository } from '../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../adapter/implementations/fake/fake.group-member.repository';
import {
  GroupMemberSourceRepositoryReadWrite,
  GroupMemberSourceRepositoryRead,
} from '../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceRepository } from '../adapter/implementations/fake/fake.group-member-source.repository';
import { UpsertCourseGroupMemberController } from '../infra/upsert-course-group-member/upsert-course-group-member.controller';
import { CreateGroupMemberHandler } from '../application/commands/create-group-member/create-group-member.command';
import { UpdateGroupMemberHandler } from '../application/commands/update-group-member/update-group-member.command';
import { FindGroupMemberHandler } from '../application/queries/find-group-member/find-group-member.query';
import { FindGroupMemberSourceHandler } from '../application/queries/find-group-member-source/find-group-member-source.query';
import { GroupMemberSourceRepositoryErrorFactory } from '../adapter/ports/group-member-source.repository.error-factory';
import { GroupMemberRepositoryErrorFactory } from '../adapter/ports/group-member.repository.error-factory';
import { FindGroupHandler } from '../application/queries/find-group/find-group.query';
import { GroupRepository } from '../adapter/ports/group.repository';
import { FakeGroupRepository } from '../adapter/implementations/fake/fake.group.repository';
import { GroupRepositoryErrorFactory } from '../adapter/ports/group.repository.error-factory';
import { UpsertGroupMemberSourceController } from '../infra/upsert-group-member-source/upsert-group-member-source.controller';
import { CreateGroupMemberSourceHandler } from '../application/commands/create-group-member-source/create-group-member-source.command';
import { UpdateGroupMemberSourceHandler } from '../application/commands/update-group-member-source/update-group-member-source.command';
import { FindGroupSourceHandler } from '../application/queries/find-group-source/find-group-source.query';
import { GroupSourceRepositoryRead } from '../adapter/ports/group-source.repository';
import { FakeGroupSourceRepository } from '../adapter/implementations/fake/fake.group-source.repository';
import { GroupSourceRepositoryErrorFactory } from '../adapter/ports/group-source.repository.error-factory';
import { UpdateGroupMemberController } from '../infra/update-group-member/update-group-member.controller';

const controllers = [
  UpsertCourseGroupMemberController,
  UpsertGroupMemberSourceController,
  UpdateGroupMemberController,
];

const handlers = [
  CreateGroupMemberHandler,
  UpdateGroupMemberHandler,
  CreateGroupMemberSourceHandler,
  UpdateGroupMemberSourceHandler,
  FindGroupHandler,
  FindGroupMemberHandler,
  FindGroupSourceHandler,
  FindGroupMemberSourceHandler,
];

const repositories = [
  { provide: GroupRepository, useClass: FakeGroupRepository },
  { provide: GroupMemberRepository, useClass: FakeGroupMemberRepository },
  {
    provide: GroupMemberSourceRepositoryRead,
    useClass: FakeGroupMemberSourceRepository,
  },
  {
    provide: GroupMemberSourceRepositoryReadWrite,
    useClass: FakeGroupMemberSourceRepository,
  },
  {
    provide: GroupSourceRepositoryRead,
    useClass: FakeGroupSourceRepository,
  },
];

const services = [
  {
    provide: GroupMemberSourceRepositoryErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
  {
    provide: GroupMemberRepositoryErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
  {
    provide: GroupRepositoryErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
  {
    provide: GroupSourceRepositoryErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
];

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class GroupMemberModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
