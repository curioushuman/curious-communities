import { INestApplicationContext, Module } from '@nestjs/common';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { UpsertMemberSourceMultiController } from './infra/upsert-member-source-multi/upsert-member-source-multi.controller';
import { MemberSourceMessagingService } from './adapter/ports/member-source.messaging-service';
import { SqsMemberSourceMessagingService } from './adapter/implementations/sqs/member-source.messaging-service';

const imports = [LoggableModule];

const controllers = [UpsertMemberSourceMultiController];

const services = [
  {
    provide: MemberSourceMessagingService,
    useClass: SqsMemberSourceMessagingService,
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
