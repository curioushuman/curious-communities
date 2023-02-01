import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  Auth0ApiHttpConfigService,
  Auth0ApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { FindMemberSourceHandler } from '../../application/queries/find-member-source/find-member-source.query';
import { FindMemberSourceController } from '../../infra/find-member-source/find-member-source.controller';
import { MemberSourceRepositoryReadWrite } from '../../adapter/ports/member-source.repository';
import { Auth0ApiMemberSourceRepository } from '../../adapter/implementations/auth0/member-source.repository';
import { MemberSourceRepositoryErrorFactory } from '../../adapter/ports/member-source.repository.error-factory';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: Auth0ApiHttpConfigService,
  }),
];

const controllers = [FindMemberSourceController];

const handlers = [FindMemberSourceHandler];

const repositories = [
  {
    provide: MemberSourceRepositoryReadWrite,
    useClass: Auth0ApiMemberSourceRepository,
  },
];

const services = [
  {
    provide: MemberSourceRepositoryErrorFactory,
    useClass: Auth0ApiRepositoryErrorFactory,
  },
];

@Module({
  imports: [...imports],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class FindMemberSourceAuthModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
