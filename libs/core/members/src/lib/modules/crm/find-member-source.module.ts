import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  SalesforceApiHttpConfigService,
  SalesforceApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { FindMemberSourceHandler } from '../../application/queries/find-member-source/find-member-source.query';
import { FindMemberSourceController } from '../../infra/find-member-source/find-member-source.controller';
import { MemberSourceRepository } from '../../adapter/ports/member-source.repository';
import { SalesforceApiMemberSourceRepository } from '../../adapter/implementations/salesforce/member-source.repository';
import { MemberSourceRepositoryErrorFactory } from '../../adapter/ports/member-source.repository.error-factory';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: SalesforceApiHttpConfigService,
  }),
];

const controllers = [FindMemberSourceController];

const handlers = [FindMemberSourceHandler];

const repositories = [
  {
    provide: MemberSourceRepository,
    useClass: SalesforceApiMemberSourceRepository,
  },
];

const services = [
  {
    provide: MemberSourceRepositoryErrorFactory,
    useClass: SalesforceApiRepositoryErrorFactory,
  },
];

@Module({
  imports: [...imports],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class FindMemberSourceCrmModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
