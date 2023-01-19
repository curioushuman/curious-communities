import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FakeRepositoryErrorFactory } from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { ParticipantRepository } from './adapter/ports/participant.repository';
import { FakeParticipantRepository } from './adapter/implementations/fake/fake.participant.repository';
import { UpdateParticipantHandler } from './application/commands/update-participant/update-participant.command';
import { UpdateParticipantController } from './infra/update-participant/update-participant.controller';
import { ParticipantSourceRepository } from './adapter/ports/participant-source.repository';
import { FakeParticipantSourceRepository } from './adapter/implementations/fake/fake.participant-source.repository';
import { ParticipantRepositoryErrorFactory } from './adapter/ports/participant.repository.error-factory';
import { FindParticipantHandler } from './application/queries/find-participant/find-participant.query';
import { FindParticipantSourceHandler } from './application/queries/find-participant-source/find-participant-source.query';
import { ParticipantSourceRepositoryErrorFactory } from './adapter/ports/participant-source.repository.error-factory';
import { SalesforceApiRepositoryErrorFactory } from './adapter/implementations/salesforce/repository.error-factory';

const controllers = [UpdateParticipantController];

const handlers = [
  UpdateParticipantHandler,
  FindParticipantHandler,
  FindParticipantSourceHandler,
];

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
export class UpdateParticipantModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
