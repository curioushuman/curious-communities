import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { FindMemberSourceHandler } from './application/queries/find-member-source/find-member-source.query';
import { UpdateMemberSourceHandler } from './application/commands/update-member-source/update-member-source.command';
import { CreateMemberSourceHandler } from './application/commands/create-member-source/create-member-source.command';
import { UpsertMemberSourceController } from './infra/upsert-member-source/upsert-member-source.controller';
import {
  MemberSourceAuthRepository,
  MemberSourceCommunityRepository,
  MemberSourceCrmRepository,
  MemberSourceMicroCourseRepository,
} from './adapter/ports/member-source.repository';
import { FakeMemberSourceAuthRepository } from './adapter/implementations/fake/fake.member-source.auth.repository';
import { FakeMemberSourceCommunityRepository } from './adapter/implementations/fake/fake.member-source.community.repository';
import { FakeMemberSourceCrmRepository } from './adapter/implementations/fake/fake.member-source.crm.repository';
import { FakeMemberSourceMicroCourseRepository } from './adapter/implementations/fake/fake.member-source.micro-course.repository';
import { MemberRepository } from './adapter/ports/member.repository';
import { FakeMemberRepository } from './adapter/implementations/fake/fake.member.repository';

const controllers = [UpsertMemberSourceController];

const handlers = [
  CreateMemberSourceHandler,
  FindMemberSourceHandler,
  UpdateMemberSourceHandler,
];

/**
 * This is the list of possible source repositories
 *
 * TODO
 * - [ ] see if you can use one of the Nest layers in the module
 *       below to dynamically load only the source repository that
 *       is required.
 *       OR consider it at a higher level?
 *       OR just leave it where it is
 */
const repositories = [
  {
    provide: MemberRepository,
    useClass: FakeMemberRepository,
  },
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
export class UpsertMemberSourceModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
