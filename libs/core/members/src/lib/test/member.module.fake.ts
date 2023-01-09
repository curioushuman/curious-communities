import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

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
import {
  MemberSourceAuthRepository,
  MemberSourceCommunityRepository,
  MemberSourceCrmRepository,
  MemberSourceMicroCourseRepository,
} from '../adapter/ports/member-source.repository';
import { FakeMemberSourceAuthRepository } from '../adapter/implementations/fake/fake.member-source.auth.repository';
import { FakeMemberSourceCommunityRepository } from '../adapter/implementations/fake/fake.member-source.community.repository';
import { FakeMemberSourceCrmRepository } from '../adapter/implementations/fake/fake.member-source.crm.repository';
import { FakeMemberSourceMicroCourseRepository } from '../adapter/implementations/fake/fake.member-source.micro-course.repository';
import { UpsertMemberSourceController } from '../infra/upsert-member-source/upsert-member-source.controller';
import { CreateMemberSourceHandler } from '../application/commands/create-member-source/create-member-source.command';
import { UpdateMemberSourceHandler } from '../application/commands/update-member-source/update-member-source.command';

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
    provide: MemberSourceAuthRepository,
    useClass: FakeMemberSourceAuthRepository,
  },
  {
    provide: MemberSourceCommunityRepository,
    useClass: FakeMemberSourceCommunityRepository,
  },
  {
    provide: MemberSourceCrmRepository,
    useClass: FakeMemberSourceCrmRepository,
  },
  {
    provide: MemberSourceMicroCourseRepository,
    useClass: FakeMemberSourceMicroCourseRepository,
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
