import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { FindParticipantSourceHandler } from './application/queries/find-participant-source/find-participant-source.query';
import { FindParticipantSourceController } from './infra/find-participant-source/find-participant-source.controller';
import { ParticipantSourceRepository } from './adapter/ports/participant-source.repository';
import { FakeParticipantSourceRepository } from './adapter/implementations/fake/fake.participant-source.repository';
import { ParticipantSourceRepositoryErrorFactory } from './adapter/ports/participant-source.repository.error-factory';
import { SalesforceApiRepositoryErrorFactory } from './adapter/implementations/salesforce/repository.error-factory';

const controllers = [FindParticipantSourceController];

const handlers = [FindParticipantSourceHandler];

const repositories = [
  {
    provide: ParticipantSourceRepository,
    useClass: FakeParticipantSourceRepository,
  },
];

const services = [
  {
    provide: ParticipantSourceRepositoryErrorFactory,
    useClass: SalesforceApiRepositoryErrorFactory,
  },
];

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class FindParticipantSourceModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
