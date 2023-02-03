import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  DynamoDbRepositoryErrorFactory,
  TribeApiHttpConfigService,
  TribeApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { FindMemberSourceHandler } from '../../application/queries/find-member-source/find-member-source.query';
import { UpdateMemberSourceHandler } from '../../application/commands/update-member-source/update-member-source.command';
import { CreateMemberSourceHandler } from '../../application/commands/create-member-source/create-member-source.command';
import { UpsertMemberSourceController } from '../../infra/upsert-member-source/upsert-member-source.controller';
import {
  MemberSourceRepositoryRead,
  MemberSourceRepositoryReadWrite,
} from '../../adapter/ports/member-source.repository';
import { MemberRepository } from '../../adapter/ports/member.repository';
import { DynamoDbMemberRepository } from '../../adapter/implementations/dynamodb/member.repository';
import { TribeApiMemberSourceRepository } from '../../adapter/implementations/tribe/member-source.repository';
import { MemberRepositoryErrorFactory } from '../../adapter/ports/member.repository.error-factory';
import { MemberSourceRepositoryErrorFactory } from '../../adapter/ports/member-source.repository.error-factory';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: TribeApiHttpConfigService,
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
    useClass: TribeApiMemberSourceRepository,
  },
  {
    provide: MemberSourceRepositoryRead,
    useClass: TribeApiMemberSourceRepository,
  },
];

const services = [
  {
    provide: MemberRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
  },
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
/**
 * NOTE: unable to use interface for applyDefaults as static methods
 * are not yet supported in interfaces
 */
export class UpsertMemberSourceCommunityModule {
  public static applyDefaults(app: INestApplicationContext): void {
    app.useLogger(new LoggableLogger());
  }
}
