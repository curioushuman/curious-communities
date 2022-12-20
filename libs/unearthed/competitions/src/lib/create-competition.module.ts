import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { CompetitionRepository } from './adapter/ports/competition.repository';
import { FakeCompetitionRepository } from './adapter/implementations/fake/fake.competition.repository';
import { CreateCompetitionHandler } from './application/commands/create-competition/create-competition.command';
import { CreateCompetitionController } from './infra/create-competition/create-competition.controller';
import { CompetitionSourceRepository } from './adapter/ports/competition-source.repository';
import { FakeCompetitionSourceRepository } from './adapter/implementations/fake/fake.competition-source.repository';

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
export class CreateCompetitionModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
