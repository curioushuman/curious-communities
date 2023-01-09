import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { FindGroupSourceHandler } from './application/queries/find-group-source/find-group-source.query';
import { FindGroupSourceController } from './infra/find-group-source/find-group-source.controller';
import {
  GroupSourceCommunityRepository,
  GroupSourceMicroCourseRepository,
} from './adapter/ports/group-source.repository';
import { FakeGroupSourceCommunityRepository } from './adapter/implementations/fake/fake.group-source.community.repository';
import { FakeGroupSourceMicroCourseRepository } from './adapter/implementations/fake/fake.group-source.micro-course.repository';

const controllers = [FindGroupSourceController];

const handlers = [FindGroupSourceHandler];

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
    provide: GroupSourceCommunityRepository,
    useClass: FakeGroupSourceCommunityRepository,
  },
  {
    provide: GroupSourceMicroCourseRepository,
    useClass: FakeGroupSourceMicroCourseRepository,
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
export class FindGroupSourceModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
