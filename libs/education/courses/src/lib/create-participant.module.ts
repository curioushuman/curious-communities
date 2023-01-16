import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FakeRepositoryErrorFactory } from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { ParticipantRepository } from './adapter/ports/participant.repository';
import { FakeParticipantRepository } from './adapter/implementations/fake/fake.participant.repository';
import { CreateParticipantHandler } from './application/commands/create-participant/create-participant.command';
import { CreateParticipantController } from './infra/create-participant/create-participant.controller';
import { ParticipantSourceRepository } from './adapter/ports/participant-source.repository';
import { FakeParticipantSourceRepository } from './adapter/implementations/fake/fake.participant-source.repository';
import { ParticipantSourceRepositoryErrorFactory } from './adapter/ports/participant-source.repository.error-factory';
import { SalesforceApiRepositoryErrorFactory } from './adapter/implementations/salesforce/repository.error-factory';
import { ParticipantRepositoryErrorFactory } from './adapter/ports/participant.repository.error-factory';

const controllers = [CreateParticipantController];

const handlers = [CreateParticipantHandler];

const repositories = [
  {
    provide: ParticipantRepository,
    useClass: FakeParticipantRepository,
  },
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
  {
    provide: ParticipantRepositoryErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
];

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class CreateParticipantModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
