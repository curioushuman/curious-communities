import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  EdAppApiHttpConfigService,
  EdAppApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { FindMemberSourceHandler } from '../../application/queries/find-member-source/find-member-source.query';
import { FindMemberSourceController } from '../../infra/find-member-source/find-member-source.controller';
import { MemberSourceRepositoryReadWrite } from '../../adapter/ports/member-source.repository';
import { EdAppApiMemberSourceRepository } from '../../adapter/implementations/ed-app/member-source.repository';
import { MemberSourceRepositoryErrorFactory } from '../../adapter/ports/member-source.repository.error-factory';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: EdAppApiHttpConfigService,
  }),
];

const controllers = [FindMemberSourceController];

const handlers = [FindMemberSourceHandler];

const repositories = [
  {
    provide: MemberSourceRepositoryReadWrite,
    useClass: EdAppApiMemberSourceRepository,
  },
];

const services = [
  {
    provide: MemberSourceRepositoryErrorFactory,
    useClass: EdAppApiRepositoryErrorFactory,
  },
];

@Module({
  imports: [...imports],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class FindMemberSourceMicroCourseModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
