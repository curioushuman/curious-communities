import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  DynamoDbRepositoryErrorFactory,
  TribeApiHttpConfigService,
  TribeApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { FindGroupMemberSourceHandler } from '../../application/queries/find-group-member-source/find-group-member-source.query';
import { UpdateGroupMemberSourceHandler } from '../../application/commands/update-group-member-source/update-group-member-source.command';
import { CreateGroupMemberSourceHandler } from '../../application/commands/create-group-member-source/create-group-member-source.command';
import { UpsertGroupMemberSourceController } from '../../infra/upsert-group-member-source/upsert-group-member-source.controller';
import {
  GroupMemberSourceRepositoryRead,
  GroupMemberSourceRepositoryReadWrite,
} from '../../adapter/ports/group-member-source.repository';
import { GroupMemberRepository } from '../../adapter/ports/group-member.repository';
import { DynamoDbGroupMemberRepository } from '../../adapter/implementations/dynamodb/group-member.repository';
import { TribeApiGroupMemberSourceRepository } from '../../adapter/implementations/tribe/group-member-source.repository';
import { GroupMemberRepositoryErrorFactory } from '../../adapter/ports/group-member.repository.error-factory';
import { GroupMemberSourceRepositoryErrorFactory } from '../../adapter/ports/group-member-source.repository.error-factory';
import { FindGroupSourceHandler } from '../../application/queries/find-group-source/find-group-source.query';
import { GroupSourceRepositoryRead } from '../../adapter/ports/group-source.repository';
import { TribeApiGroupSourceRepository } from '../../adapter/implementations/tribe/group-source.repository';
import { GroupSourceRepositoryErrorFactory } from '../../adapter/ports/group-source.repository.error-factory';
import { FindGroupMemberHandler } from '../../application/queries/find-group-member/find-group-member.query';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: TribeApiHttpConfigService,
  }),
];

const controllers = [UpsertGroupMemberSourceController];

const handlers = [
  CreateGroupMemberSourceHandler,
  UpdateGroupMemberSourceHandler,
  FindGroupMemberHandler,
  FindGroupMemberSourceHandler,
  FindGroupSourceHandler,
];

const repositories = [
  {
    provide: GroupMemberRepository,
    useClass: DynamoDbGroupMemberRepository,
  },
  {
    provide: GroupMemberSourceRepositoryReadWrite,
    useClass: TribeApiGroupMemberSourceRepository,
  },
  {
    provide: GroupMemberSourceRepositoryRead,
    useClass: TribeApiGroupMemberSourceRepository,
  },
  {
    provide: GroupSourceRepositoryRead,
    useClass: TribeApiGroupSourceRepository,
  },
];

const services = [
  {
    provide: GroupMemberRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
  },
  {
    provide: GroupMemberSourceRepositoryErrorFactory,
    useClass: TribeApiRepositoryErrorFactory,
  },
  {
    provide: GroupSourceRepositoryErrorFactory,
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
export class UpsertGroupMemberSourceCommunityModule {
  public static applyDefaults(app: INestApplicationContext): void {
    app.useLogger(new LoggableLogger());
  }
}
