import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { GroupRepository } from './adapter/ports/group.repository';
import { FakeGroupRepository } from './adapter/implementations/fake/fake.group.repository';
import { UpdateGroupHandler } from './application/commands/update-group/update-group.command';
import { UpdateGroupController } from './infra/update-group/update-group.controller';
import { GroupSourceRepository } from './adapter/ports/group-source.repository';
import { FakeGroupSourceRepository } from './adapter/implementations/fake/fake.group-source.repository';

const controllers = [UpdateGroupController];

const handlers = [UpdateGroupHandler];

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
export class UpdateGroupModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
