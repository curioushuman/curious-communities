import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  DynamoDbRepositoryErrorFactory,
  EdAppApiHttpConfigService,
  EdAppApiRepositoryErrorFactory,
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
import { EdAppApiGroupMemberSourceRepository } from '../../adapter/implementations/ed-app/group-member-source.repository';
import { GroupMemberRepositoryErrorFactory } from '../../adapter/ports/group-member.repository.error-factory';
import { GroupMemberSourceRepositoryErrorFactory } from '../../adapter/ports/group-member-source.repository.error-factory';
import { FindGroupSourceHandler } from '../../application/queries/find-group-source/find-group-source.query';
import { GroupSourceRepositoryRead } from '../../adapter/ports/group-source.repository';
import { EdAppApiGroupSourceRepository } from '../../adapter/implementations/ed-app/group-source.repository';
import { GroupSourceRepositoryErrorFactory } from '../../adapter/ports/group-source.repository.error-factory';
import { FindGroupMemberHandler } from '../../application/queries/find-group-member/find-group-member.query';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: EdAppApiHttpConfigService,
  }),
];

const controllers = [UpsertGroupMemberSourceController];

const handlers = [
  CreateGroupMemberSourceHandler,
  UpdateGroupMemberSourceHandler,
  FindGroupMemberSourceHandler,
  FindGroupMemberHandler,
  FindGroupSourceHandler,
];

const repositories = [
  {
    provide: GroupMemberRepository,
    useClass: DynamoDbGroupMemberRepository,
  },
  {
    provide: GroupMemberSourceRepositoryReadWrite,
    useClass: EdAppApiGroupMemberSourceRepository,
  },
  {
    provide: GroupMemberSourceRepositoryRead,
    useClass: EdAppApiGroupMemberSourceRepository,
  },
  {
    provide: GroupSourceRepositoryRead,
    useClass: EdAppApiGroupSourceRepository,
  },
];

const services = [
  {
    provide: GroupMemberRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
  },
  {
    provide: GroupMemberSourceRepositoryErrorFactory,
    useClass: EdAppApiRepositoryErrorFactory,
  },
  {
    provide: GroupSourceRepositoryErrorFactory,
    useClass: EdAppApiRepositoryErrorFactory,
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
export class UpsertGroupMemberSourceMicroCourseModule {
  public static applyDefaults(app: INestApplicationContext): void {
    app.useLogger(new LoggableLogger());
  }
}
