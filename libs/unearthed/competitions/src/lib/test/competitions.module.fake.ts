import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

import { CompetitionRepository } from '../adapter/ports/competition.repository';
import { FakeCompetitionRepository } from '../adapter/implementations/fake/fake.competition.repository';
import { CompetitionSourceRepository } from '../adapter/ports/competition-source.repository';
import { FakeCompetitionSourceRepository } from '../adapter/implementations/fake/fake.competition-source.repository';
import { CreateCompetitionController } from '../infra/create-competition/create-competition.controller';
import { CreateCompetitionHandler } from '../application/commands/create-competition/create-competition.command';
// import { ParticipantRepository } from '../adapter/ports/participant.repository';
// import { FakeParticipantRepository } from '../adapter/implementations/fake/fake.participant.repository';
// import { ParticipantSourceRepository } from '../adapter/ports/participant-source.repository';
// import { FakeParticipantSourceRepository } from '../adapter/implementations/fake/fake.participant-source.repository';

const controllers = [CreateCompetitionController];

const handlers = [CreateCompetitionHandler];

const repositories = [
  {
    provide: CompetitionRepository,
    useClass: FakeCompetitionRepository,
  },
  {
    provide: CompetitionSourceRepository,
    useClass: FakeCompetitionSourceRepository,
  },
  // { provide: ParticipantRepository, useClass: FakeParticipantRepository },
  // {
  //   provide: ParticipantSourceRepository,
  //   useClass: FakeParticipantSourceRepository,
  // },
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
export class CompetitionsModule {}
