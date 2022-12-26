import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { GroupMemberRepository } from './adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from './adapter/implementations/fake/fake.group-member.repository';
import { CreateGroupMemberHandler } from './application/commands/create-group-member/create-group-member.command';
import { CreateGroupMemberController } from './infra/create-group-member/create-group-member.controller';
import { GroupMemberSourceRepository } from './adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceRepository } from './adapter/implementations/fake/fake.group-member-source.repository';

const controllers = [CreateGroupMemberController];

const handlers = [CreateGroupMemberHandler];

const repositories = [
  {
    provide: GroupMemberRepository,
    useClass: FakeGroupMemberRepository,
  },
  {
    provide: GroupMemberSourceRepository,
    useClass: FakeGroupMemberSourceRepository,
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
export class CreateGroupMemberModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
