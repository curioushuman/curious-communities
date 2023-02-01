import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  DynamoDbRepositoryErrorFactory,
  Auth0ApiHttpConfigService,
  Auth0ApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { FindMemberSourceHandler } from '../../application/queries/find-member-source/find-member-source.query';
import { UpdateMemberSourceHandler } from '../../application/commands/update-member-source/update-member-source.command';
import { CreateMemberSourceHandler } from '../../application/commands/create-member-source/create-member-source.command';
import { UpsertMemberSourceController } from '../../infra/upsert-member-source/upsert-member-source.controller';
import { MemberSourceRepositoryReadWrite } from '../../adapter/ports/member-source.repository';
import { MemberRepository } from '../../adapter/ports/member.repository';
import { DynamoDbMemberRepository } from '../../adapter/implementations/dynamodb/member.repository';
import { Auth0ApiMemberSourceRepository } from '../../adapter/implementations/auth0/member-source.repository';
import { MemberRepositoryErrorFactory } from '../../adapter/ports/member.repository.error-factory';
import { MemberSourceRepositoryErrorFactory } from '../../adapter/ports/member-source.repository.error-factory';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: Auth0ApiHttpConfigService,
  }),
];

const controllers = [UpsertMemberSourceController];

const handlers = [
  CreateMemberSourceHandler,
  FindMemberSourceHandler,
  UpdateMemberSourceHandler,
];

const repositories = [
  {
    provide: MemberRepository,
    useClass: DynamoDbMemberRepository,
  },
  {
    provide: MemberSourceRepositoryReadWrite,
    useClass: Auth0ApiMemberSourceRepository,
  },
];

const services = [
  {
    provide: MemberRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
  },
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
/**
 * NOTE: unable to use interface for applyDefaults as static methods
 * are not yet supported in interfaces
 */
export class UpsertMemberSourceAuthModule {
  public static applyDefaults(app: INestApplicationContext): void {
    app.useLogger(new LoggableLogger());
  }
}
