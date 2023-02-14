import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';
import { UpdateGroupHandler } from './application/commands/update-group/update-group.command';
import { CreateGroupHandler } from './application/commands/create-group/create-group.command';
import { FindGroupHandler } from './application/queries/find-group/find-group.query';
import { GroupRepository } from './adapter/ports/group.repository';
import { DynamoDbGroupRepository } from './adapter/implementations/dynamodb/group.repository';
import { GroupRepositoryErrorFactory } from './adapter/ports/group.repository.error-factory';
import { UpsertCourseGroupController } from './infra/upsert-course-group/upsert-course-group.controller';

const imports = [CqrsModule, LoggableModule];

const controllers = [UpsertCourseGroupController];

const handlers = [UpdateGroupHandler, CreateGroupHandler, FindGroupHandler];

const repositories = [
  {
    provide: GroupRepository,
    useClass: DynamoDbGroupRepository,
  },
];

const services = [
  {
    provide: GroupRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
  },
];

@Module({
  imports: [...imports],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class UpsertCourseGroupModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
