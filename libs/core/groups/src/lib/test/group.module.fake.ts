import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FakeRepositoryErrorFactory } from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { GroupRepository } from '../adapter/ports/group.repository';
import { FakeGroupRepository } from '../adapter/implementations/fake/fake.group.repository';
import {
  GroupSourceRepositoryReadWrite,
  GroupSourceRepositoryRead,
} from '../adapter/ports/group-source.repository';
import { FakeGroupSourceRepository } from '../adapter/implementations/fake/fake.group-source.repository';
import { UpsertCourseGroupController } from '../infra/upsert-course-group/upsert-course-group.controller';
import { CreateGroupHandler } from '../application/commands/create-group/create-group.command';
import { FindGroupHandler } from '../application/queries/find-group/find-group.query';
import { GroupSourceRepositoryErrorFactory } from '../adapter/ports/group-source.repository.error-factory';
import { GroupRepositoryErrorFactory } from '../adapter/ports/group.repository.error-factory';
import { FindGroupSourceHandler } from '../application/queries/find-group-source/find-group-source.query';
import { UpdateGroupHandler } from '../application/commands/update-group/update-group.command';
import { UpsertGroupSourceController } from '../infra/upsert-group-source/upsert-group-source.controller';
import { CreateGroupSourceHandler } from '../application/commands/create-group-source/create-group-source.command';
import { UpdateGroupSourceHandler } from '../application/commands/update-group-source/update-group-source.command';
import { UpdateGroupController } from '../infra/update-group/update-group.controller';

const controllers = [
  UpsertCourseGroupController,
  UpsertGroupSourceController,
  UpdateGroupController,
];

const handlers = [
  CreateGroupHandler,
  UpdateGroupHandler,
  CreateGroupSourceHandler,
  UpdateGroupSourceHandler,
  FindGroupHandler,
  FindGroupSourceHandler,
];

const repositories = [
  {
    provide: GroupRepository,
    useClass: FakeGroupRepository,
  },
  {
    provide: GroupSourceRepositoryRead,
    useClass: FakeGroupSourceRepository,
  },
  {
    provide: GroupSourceRepositoryReadWrite,
    useClass: FakeGroupSourceRepository,
  },
];

const services = [
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
export class GroupModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
