import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { MemberRepository } from './adapter/ports/member.repository';
import { FakeMemberRepository } from './adapter/implementations/fake/fake.member.repository';
import { FindMemberHandler } from './application/queries/find-member/find-member.query';
import { FindMemberController } from './infra/find-member/find-member.controller';

const controllers = [FindMemberController];

const handlers = [FindMemberHandler];

const repositories = [
  {
    provide: MemberRepository,
    useClass: FakeMemberRepository,
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
export class FindMemberModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
