import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

import { GroupMemberRepository } from '../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../adapter/implementations/fake/fake.group-member.repository';
import { GroupMemberSourceRepository } from '../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceRepository } from '../adapter/implementations/fake/fake.group-member-source.repository';
import { CreateGroupMemberController } from '../infra/create-group-member/create-group-member.controller';
import { UpdateGroupMemberController } from '../infra/update-group-member/update-group-member.controller';
import { CreateGroupMemberHandler } from '../application/commands/create-group-member/create-group-member.command';
import { UpdateGroupMemberHandler } from '../application/commands/update-group-member/update-group-member.command';

const controllers = [CreateGroupMemberController, UpdateGroupMemberController];

const handlers = [CreateGroupMemberHandler, UpdateGroupMemberHandler];

const repositories = [
  { provide: GroupMemberRepository, useClass: FakeGroupMemberRepository },
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
export class GroupMemberModule {}
