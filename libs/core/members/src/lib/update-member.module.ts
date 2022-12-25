import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { MemberRepository } from './adapter/ports/member.repository';
import { FakeMemberRepository } from './adapter/implementations/fake/fake.member.repository';
import { UpdateMemberHandler } from './application/commands/update-member/update-member.command';
import { UpdateMemberController } from './infra/update-member/update-member.controller';
import { MemberSourceRepository } from './adapter/ports/member-source.repository';
import { FakeMemberSourceRepository } from './adapter/implementations/fake/fake.member-source.repository';

const controllers = [UpdateMemberController];

const handlers = [UpdateMemberHandler];

const repositories = [
  {
    provide: MemberRepository,
    useClass: FakeMemberRepository,
  },
  {
    provide: MemberSourceRepository,
    useClass: FakeMemberSourceRepository,
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
export class UpdateMemberModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
