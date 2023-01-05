import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { ParticipantRepository } from './adapter/ports/participant.repository';
import { FakeParticipantRepository } from './adapter/implementations/fake/fake.participant.repository';
import { FindParticipantHandler } from './application/queries/find-participant/find-participant.query';
import { FindParticipantController } from './infra/find-participant/find-participant.controller';
import { ParticipantSourceRepository } from './adapter/ports/participant-source.repository';
import { FakeParticipantSourceRepository } from './adapter/implementations/fake/fake.participant-source.repository';

const controllers = [FindParticipantController];

const handlers = [FindParticipantHandler];

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
    provide: ErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
];

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class FindParticipantModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
