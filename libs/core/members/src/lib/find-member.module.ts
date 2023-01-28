import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';

import { MemberRepository } from './adapter/ports/member.repository';
import { FindMemberHandler } from './application/queries/find-member/find-member.query';
import { FindMemberController } from './infra/find-member/find-member.controller';
import { DynamoDbMemberRepository } from './adapter/implementations/dynamodb/member.repository';
import { MemberRepositoryErrorFactory } from './adapter/ports/member.repository.error-factory';

const controllers = [FindMemberController];

const handlers = [FindMemberHandler];

const repositories = [
  {
    provide: MemberRepository,
    useClass: DynamoDbMemberRepository,
  },
];

const services = [
  {
    provide: MemberRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
  },
];

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class FindMemberModule {
  public static applyDefaults(app: INestApplicationContext): void {
    app.useLogger(new LoggableLogger());
  }
}
