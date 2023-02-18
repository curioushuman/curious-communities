import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';
import { UpdateGroupMemberController } from './infra/update-group-member/update-group-member.controller';
import { UpdateGroupMemberHandler } from './application/commands/update-group-member/update-group-member.command';
import { FindGroupMemberHandler } from './application/queries/find-group-member/find-group-member.query';
import { FindGroupHandler } from './application/queries/find-group/find-group.query';
import { GroupRepository } from './adapter/ports/group.repository';
import { DynamoDbGroupRepository } from './adapter/implementations/dynamodb/group.repository';
import { GroupMemberRepository } from './adapter/ports/group-member.repository';
import { DynamoDbGroupMemberRepository } from './adapter/implementations/dynamodb/group-member.repository';
import { GroupRepositoryErrorFactory } from './adapter/ports/group.repository.error-factory';
import { GroupMemberRepositoryErrorFactory } from './adapter/ports/group-member.repository.error-factory';

const imports = [CqrsModule, LoggableModule];

const controllers = [UpdateGroupMemberController];

const handlers = [
  UpdateGroupMemberHandler,
  FindGroupMemberHandler,
  FindGroupHandler,
];

const repositories = [
  {
    provide: GroupRepository,
    useClass: DynamoDbGroupRepository,
  },
  {
    provide: GroupMemberRepository,
    useClass: DynamoDbGroupMemberRepository,
  },
];

const services = [
  {
    provide: GroupRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
  },
  {
    provide: GroupMemberRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
  },
];

@Module({
  imports: [...imports],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class UpdateGroupMemberModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
