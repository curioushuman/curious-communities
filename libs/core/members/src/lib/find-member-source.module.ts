import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { FindMemberSourceHandler } from './application/queries/find-member-source/find-member-source.query';
import { FindMemberSourceController } from './infra/find-member-source/find-member-source.controller';
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

const controllers = [FindMemberSourceController];

const handlers = [FindMemberSourceHandler];

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
export class FindMemberSourceModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
