import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  DynamoDbRepositoryErrorFactory,
  SalesforceApiHttpConfigService,
  SalesforceApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { ParticipantRepository } from './adapter/ports/participant.repository';
import { UpdateParticipantHandler } from './application/commands/update-participant/update-participant.command';
import { UpdateParticipantController } from './infra/update-participant/update-participant.controller';
import { ParticipantSourceRepository } from './adapter/ports/participant-source.repository';
import { ParticipantRepositoryErrorFactory } from './adapter/ports/participant.repository.error-factory';
import { FindParticipantHandler } from './application/queries/find-participant/find-participant.query';
import { FindParticipantSourceHandler } from './application/queries/find-participant-source/find-participant-source.query';
import { ParticipantSourceRepositoryErrorFactory } from './adapter/ports/participant-source.repository.error-factory';
import { DynamoDbParticipantRepository } from './adapter/implementations/dynamodb/participant.repository';
import { SalesforceApiParticipantSourceRepository } from './adapter/implementations/salesforce/participant-source.repository';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: SalesforceApiHttpConfigService,
  }),
];

const controllers = [UpdateParticipantController];

const handlers = [
  UpdateParticipantHandler,
  FindParticipantHandler,
  FindParticipantSourceHandler,
];

const repositories = [
  {
    provide: ParticipantRepository,
    useClass: DynamoDbParticipantRepository,
  },
  {
    provide: ParticipantSourceRepository,
    useClass: SalesforceApiParticipantSourceRepository,
  },
];

const services = [
  {
    provide: ParticipantRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
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
export class UpdateParticipantModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
