import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FakeRepositoryErrorFactory } from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { ParticipantRepository } from '../adapter/ports/participant.repository';
import { FakeParticipantRepository } from '../adapter/implementations/fake/fake.participant.repository';
import { ParticipantSourceRepository } from '../adapter/ports/participant-source.repository';
import { FakeParticipantSourceRepository } from '../adapter/implementations/fake/fake.participant-source.repository';
import { CreateParticipantController } from '../infra/create-participant/create-participant.controller';
import { UpdateParticipantController } from '../infra/update-participant/update-participant.controller';
import { CreateParticipantHandler } from '../application/commands/create-participant/create-participant.command';
import { UpdateParticipantHandler } from '../application/commands/update-participant/update-participant.command';
import { FindParticipantHandler } from '../application/queries/find-participant/find-participant.query';
import { FindParticipantController } from '../infra/find-participant/find-participant.controller';
import { FindParticipantSourceHandler } from '../application/queries/find-participant-source/find-participant-source.query';
import { FindParticipantSourceController } from '../infra/find-participant-source/find-participant-source.controller';
import { ParticipantSourceRepositoryErrorFactory } from '../adapter/ports/participant-source.repository.error-factory';
import { ParticipantRepositoryErrorFactory } from '../adapter/ports/participant.repository.error-factory';

const controllers = [
  CreateParticipantController,
  FindParticipantController,
  FindParticipantSourceController,
  UpdateParticipantController,
];

const handlers = [
  CreateParticipantHandler,
  FindParticipantHandler,
  FindParticipantSourceHandler,
  UpdateParticipantHandler,
];

const repositories = [
  { provide: ParticipantRepository, useClass: FakeParticipantRepository },
  {
    provide: ParticipantSourceRepository,
    useClass: FakeParticipantSourceRepository,
  },
];

const services = [
  {
    provide: ParticipantSourceRepositoryErrorFactory,
    useClass: FakeRepositoryErrorFactory,
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
export class ParticipantModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
