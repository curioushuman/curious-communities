import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { GroupRepository } from './adapter/ports/group.repository';
import { FakeGroupRepository } from './adapter/implementations/fake/fake.group.repository';
import { FindGroupHandler } from './application/queries/find-group/find-group.query';
import { FindGroupController } from './infra/find-group/find-group.controller';

const controllers = [FindGroupController];

const handlers = [FindGroupHandler];

const repositories = [
  {
    provide: GroupRepository,
    useClass: FakeGroupRepository,
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
export class FindGroupModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
