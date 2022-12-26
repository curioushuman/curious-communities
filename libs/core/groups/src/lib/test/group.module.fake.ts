import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

import { GroupRepository } from '../adapter/ports/group.repository';
import { FakeGroupRepository } from '../adapter/implementations/fake/fake.group.repository';
import { GroupSourceRepository } from '../adapter/ports/group-source.repository';
import { FakeGroupSourceRepository } from '../adapter/implementations/fake/fake.group-source.repository';
import { CreateGroupController } from '../infra/create-group/create-group.controller';
import { CreateGroupHandler } from '../application/commands/create-group/create-group.command';
import { UpdateGroupController } from '../infra/update-group/update-group.controller';
import { UpdateGroupHandler } from '../application/commands/update-group/update-group.command';

const controllers = [CreateGroupController, UpdateGroupController];

const handlers = [CreateGroupHandler, UpdateGroupHandler];

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
export class GroupModule {}
