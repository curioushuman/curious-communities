import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  SalesforceApiHttpConfigService,
  SalesforceApiRepository,
  SalesforceApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { FindParticipantSourceHandler } from './application/queries/find-participant-source/find-participant-source.query';
import { UpsertParticipantMultiController } from './infra/upsert-participant-multi/upsert-participant-multi.controller';
import { ParticipantMessagingService } from './adapter/ports/participant.messaging-service';
import { SqsParticipantMessagingService } from './adapter/implementations/sqs/participant.messaging-service';
import { ParticipantSourceRepository } from './adapter/ports/participant-source.repository';
import { ParticipantSourceRepositoryErrorFactory } from './adapter/ports/participant-source.repository.error-factory';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: SalesforceApiHttpConfigService,
  }),
];

const controllers = [UpsertParticipantMultiController];

const handlers = [FindParticipantSourceHandler];

const repositories = [
  {
    provide: ParticipantSourceRepository,
    useClass: SalesforceApiRepository,
  },
];

const services = [
  {
    provide: ParticipantMessagingService,
    useClass: SqsParticipantMessagingService,
  },
  {
    provide: ParticipantSourceRepositoryErrorFactory,
    useClass: SalesforceApiRepositoryErrorFactory,
  },
];

@Module({
  imports: [...imports],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class UpsertParticipantMultiModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
