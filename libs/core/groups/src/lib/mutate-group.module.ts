import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { GroupRepository } from './adapter/ports/group.repository';
import { FakeGroupRepository } from './adapter/implementations/fake/fake.group.repository';
import { CreateGroupHandler } from './application/commands/create-group/create-group.command';
import { CreateGroupController } from './infra/create-group/create-group.controller';
import { UpdateGroupHandler } from './application/commands/update-group/update-group.command';
import { UpdateGroupController } from './infra/update-group/update-group.controller';
import {
  GroupSourceCommunityRepository,
  GroupSourceMicroCourseRepository,
} from './adapter/ports/group-source.repository';
import { FakeGroupSourceCommunityRepository } from './adapter/implementations/fake/fake.group-source.community.repository';
import { FakeGroupSourceMicroCourseRepository } from './adapter/implementations/fake/fake.group-source.micro-course.repository';

const controllers = [UpdateGroupController, CreateGroupController];

const handlers = [UpdateGroupHandler, CreateGroupHandler];

const repositories = [
  {
    provide: GroupRepository,
    useClass: FakeGroupRepository,
  },
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
export class MutateGroupModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
