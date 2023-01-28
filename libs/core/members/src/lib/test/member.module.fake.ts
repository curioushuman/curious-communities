import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FakeRepositoryErrorFactory } from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { MemberRepository } from '../adapter/ports/member.repository';
import { FakeMemberRepository } from '../adapter/implementations/fake/fake.member.repository';
import { CreateMemberController } from '../infra/create-member/create-member.controller';
import { UpdateMemberController } from '../infra/update-member/update-member.controller';
import { CreateMemberHandler } from '../application/commands/create-member/create-member.command';
import { UpdateMemberHandler } from '../application/commands/update-member/update-member.command';
import { FindMemberHandler } from '../application/queries/find-member/find-member.query';
import { FindMemberController } from '../infra/find-member/find-member.controller';
import { FindMemberSourceHandler } from '../application/queries/find-member-source/find-member-source.query';
import { FindMemberSourceController } from '../infra/find-member-source/find-member-source.controller';
import { UpsertMemberSourceController } from '../infra/upsert-member-source/upsert-member-source.controller';
import { CreateMemberSourceHandler } from '../application/commands/create-member-source/create-member-source.command';
import { UpdateMemberSourceHandler } from '../application/commands/update-member-source/update-member-source.command';
import { MemberSourceRepository } from '../adapter/ports/member-source.repository';
import { FakeMemberSourceRepository } from '../adapter/implementations/fake/fake.member-source.repository';
import { MemberRepositoryErrorFactory } from '../adapter/ports/member.repository.error-factory';
import { MemberSourceRepositoryErrorFactory } from '../adapter/ports/member-source.repository.error-factory';

const controllers = [
  CreateMemberController,
  FindMemberController,
  FindMemberSourceController,
  UpdateMemberController,
  UpsertMemberSourceController,
];

const handlers = [
  CreateMemberHandler,
  CreateMemberSourceHandler,
  FindMemberHandler,
  FindMemberSourceHandler,
  UpdateMemberHandler,
  UpdateMemberSourceHandler,
];

const repositories = [
  { provide: MemberRepository, useClass: FakeMemberRepository },
  {
    provide: MemberSourceRepository,
    useClass: FakeMemberSourceRepository,
  },
];

const services = [
  {
    provide: MemberRepositoryErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
  {
    provide: MemberSourceRepositoryErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
];

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class MemberModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
