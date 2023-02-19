import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';
import { FindGroupMemberHandler } from './application/queries/find-group-member/find-group-member.query';
import { GroupMemberRepository } from './adapter/ports/group-member.repository';
import { DynamoDbGroupMemberRepository } from './adapter/implementations/dynamodb/group-member.repository';
import { GroupMemberRepositoryErrorFactory } from './adapter/ports/group-member.repository.error-factory';
import { UpdateGroupMemberMultiController } from './infra/update-group-member-multi/update-group-member-multi.controller';
import { GroupMemberMessagingService } from './adapter/ports/group-member.messaging-service';
import { SqsGroupMemberMessagingService } from './adapter/implementations/sqs/group-member.messaging-service';

const imports = [CqrsModule, LoggableModule];

const controllers = [UpdateGroupMemberMultiController];

const handlers = [FindGroupMemberHandler];

const repositories = [
  {
    provide: GroupMemberRepository,
    useClass: DynamoDbGroupMemberRepository,
  },
];

const services = [
  {
    provide: GroupMemberMessagingService,
    useClass: SqsGroupMemberMessagingService,
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
export class UpdateGroupMemberMultiModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
