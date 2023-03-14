import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  SalesforceApiHttpConfigService,
  SalesforceApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { UpsertParticipantMultiController } from './infra/upsert-participant-multi/upsert-participant-multi.controller';
import { ParticipantQueueService } from './adapter/ports/participant.queue-service';
import { SqsParticipantQueueService } from './adapter/implementations/sqs/participant.queue-service';
import { ParticipantSourceRepository } from './adapter/ports/participant-source.repository';
import { ParticipantSourceRepositoryErrorFactory } from './adapter/ports/participant-source.repository.error-factory';
import { SalesforceApiParticipantSourceRepository } from './adapter/implementations/salesforce/participant-source.repository';
import { FindParticipantSourcesHandler } from './application/queries/find-participant-sources/find-participant-sources.query';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: SalesforceApiHttpConfigService,
  }),
];

const controllers = [UpsertParticipantMultiController];

const handlers = [FindParticipantSourcesHandler];

const repositories = [
  {
    provide: ParticipantSourceRepository,
    useClass: SalesforceApiParticipantSourceRepository,
  },
];

const services = [
  {
    provide: ParticipantQueueService,
    useClass: SqsParticipantQueueService,
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
