import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  TribeApiHttpConfigService,
  TribeApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { FindMemberSourceHandler } from '../../application/queries/find-member-source/find-member-source.query';
import { FindMemberSourceController } from '../../infra/find-member-source/find-member-source.controller';
import { MemberSourceRepositoryReadWrite } from '../../adapter/ports/member-source.repository';
import { TribeApiMemberSourceRepository } from '../../adapter/implementations/tribe/member-source.repository';
import { MemberSourceRepositoryErrorFactory } from '../../adapter/ports/member-source.repository.error-factory';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: TribeApiHttpConfigService,
  }),
];

const controllers = [FindMemberSourceController];

const handlers = [FindMemberSourceHandler];

const repositories = [
  {
    provide: MemberSourceRepositoryReadWrite,
    useClass: TribeApiMemberSourceRepository,
  },
];

const services = [
  {
    provide: MemberSourceRepositoryErrorFactory,
    useClass: TribeApiRepositoryErrorFactory,
  },
];

@Module({
  imports: [...imports],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class FindMemberSourceCommunityModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
