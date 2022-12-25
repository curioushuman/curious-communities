import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

import { MemberRepository } from '../adapter/ports/member.repository';
import { FakeMemberRepository } from '../adapter/implementations/fake/fake.member.repository';
import { MemberSourceRepository } from '../adapter/ports/member-source.repository';
import { FakeMemberSourceRepository } from '../adapter/implementations/fake/fake.member-source.repository';
import { CreateMemberController } from '../infra/create-member/create-member.controller';
import { CreateMemberHandler } from '../application/commands/create-member/create-member.command';
import { UpdateMemberController } from '../infra/update-member/update-member.controller';
import { UpdateMemberHandler } from '../application/commands/update-member/update-member.command';

const controllers = [CreateMemberController, UpdateMemberController];

const handlers = [CreateMemberHandler, UpdateMemberHandler];

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
export class MemberModule {}
