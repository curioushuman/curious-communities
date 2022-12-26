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
import { GroupSourceRepository } from './adapter/ports/group-source.repository';
import { FakeGroupSourceRepository } from './adapter/implementations/fake/fake.group-source.repository';

const controllers = [CreateGroupController];

const handlers = [CreateGroupHandler];

const repositories = [
  {
    provide: GroupRepository,
    useClass: FakeGroupRepository,
  },
  {
    provide: GroupSourceRepository,
    useClass: FakeGroupSourceRepository,
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
export class CreateGroupModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
