import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  SalesforceApiHttpConfigService,
  SalesforceApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { FindParticipantSourceHandler } from './application/queries/find-participant-source/find-participant-source.query';
import { FindParticipantSourceController } from './infra/find-participant-source/find-participant-source.controller';
import { ParticipantSourceRepository } from './adapter/ports/participant-source.repository';
import { ParticipantSourceRepositoryErrorFactory } from './adapter/ports/participant-source.repository.error-factory';
import { SalesforceApiParticipantSourceRepository } from './adapter/implementations/salesforce/participant-source.repository';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: SalesforceApiHttpConfigService,
  }),
];

const controllers = [FindParticipantSourceController];

const handlers = [FindParticipantSourceHandler];

const repositories = [
  {
    provide: ParticipantSourceRepository,
    useClass: SalesforceApiParticipantSourceRepository,
  },
];

const services = [
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
export class FindParticipantSourceModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
