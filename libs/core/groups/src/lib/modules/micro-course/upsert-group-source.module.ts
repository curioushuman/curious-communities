import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  DynamoDbRepositoryErrorFactory,
  EdAppApiHttpConfigService,
  EdAppApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { FindGroupSourceHandler } from '../../application/queries/find-group-source/find-group-source.query';
import { UpdateGroupSourceHandler } from '../../application/commands/update-group-source/update-group-source.command';
import { CreateGroupSourceHandler } from '../../application/commands/create-group-source/create-group-source.command';
import { UpsertGroupSourceController } from '../../infra/upsert-group-source/upsert-group-source.controller';
import {
  GroupSourceRepositoryRead,
  GroupSourceRepositoryReadWrite,
} from '../../adapter/ports/group-source.repository';
import { GroupRepository } from '../../adapter/ports/group.repository';
import { DynamoDbGroupRepository } from '../../adapter/implementations/dynamodb/group.repository';
import { EdAppApiGroupSourceRepository } from '../../adapter/implementations/ed-app/group-source.repository';
import { GroupRepositoryErrorFactory } from '../../adapter/ports/group.repository.error-factory';
import { GroupSourceRepositoryErrorFactory } from '../../adapter/ports/group-source.repository.error-factory';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: EdAppApiHttpConfigService,
  }),
];

const controllers = [UpsertGroupSourceController];

const handlers = [
  CreateGroupSourceHandler,
  FindGroupSourceHandler,
  UpdateGroupSourceHandler,
];

const repositories = [
  {
    provide: GroupRepository,
    useClass: DynamoDbGroupRepository,
  },
  {
    provide: GroupSourceRepositoryReadWrite,
    useClass: EdAppApiGroupSourceRepository,
  },
  {
    provide: GroupSourceRepositoryRead,
    useClass: EdAppApiGroupSourceRepository,
  },
];

const services = [
  {
    provide: GroupRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
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
export class UpsertGroupSourceMicroCourseModule {
  public static applyDefaults(app: INestApplicationContext): void {
    app.useLogger(new LoggableLogger());
  }
}
