import { INestApplicationContext, Module } from '@nestjs/common';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { UpsertMemberSourceMultiController } from './infra/upsert-member-source-multi/upsert-member-source-multi.controller';
import { MemberSourceQueueService } from './adapter/ports/member-source.queue-service';
import { SqsMemberSourceQueueService } from './adapter/implementations/sqs/member-source.queue-service';

const imports = [LoggableModule];

const controllers = [UpsertMemberSourceMultiController];

const services = [
  {
    provide: MemberSourceQueueService,
    useClass: SqsMemberSourceQueueService,
  },
];

@Module({
  imports: [...imports],
  controllers: [...controllers],
  providers: [...services],
  exports: [],
})
export class UpsertMemberSourceMultiModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
