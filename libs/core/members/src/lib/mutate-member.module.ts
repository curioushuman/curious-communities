import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  DynamoDbRepositoryErrorFactory,
  SalesforceApiHttpConfigService,
  SalesforceApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { MemberRepository } from './adapter/ports/member.repository';
import { CreateMemberHandler } from './application/commands/create-member/create-member.command';
import { CreateMemberController } from './infra/create-member/create-member.controller';
import { UpdateMemberHandler } from './application/commands/update-member/update-member.command';
import { UpdateMemberController } from './infra/update-member/update-member.controller';
import { MemberSourceRepository } from './adapter/ports/member-source.repository';
import { DynamoDbMemberRepository } from './adapter/implementations/dynamodb/member.repository';
import { SalesforceApiMemberSourceRepository } from './adapter/implementations/salesforce/member-source.repository';
import { MemberRepositoryErrorFactory } from './adapter/ports/member.repository.error-factory';
import { MemberSourceRepositoryErrorFactory } from './adapter/ports/member-source.repository.error-factory';
import { FindMemberHandler } from './application/queries/find-member/find-member.query';
import { FindMemberSourceHandler } from './application/queries/find-member-source/find-member-source.query';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: SalesforceApiHttpConfigService,
  }),
];

const controllers = [UpdateMemberController, CreateMemberController];

const handlers = [
  UpdateMemberHandler,
  CreateMemberHandler,
  FindMemberHandler,
  FindMemberSourceHandler,
];

const repositories = [
  {
    provide: MemberRepository,
    useClass: DynamoDbMemberRepository,
  },
  {
    provide: MemberSourceRepository,
    useClass: SalesforceApiMemberSourceRepository,
  },
];

const services = [
  {
    provide: MemberRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
  },
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
export class MutateMemberModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
