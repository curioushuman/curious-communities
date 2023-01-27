import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';

import { ParticipantRepository } from './adapter/ports/participant.repository';
import { FindParticipantHandler } from './application/queries/find-participant/find-participant.query';
import { FindParticipantController } from './infra/find-participant/find-participant.controller';
import { ParticipantRepositoryErrorFactory } from './adapter/ports/participant.repository.error-factory';
import { DynamoDbParticipantRepository } from './adapter/implementations/dynamodb/participant.repository';

const controllers = [FindParticipantController];

const handlers = [FindParticipantHandler];

const repositories = [
  {
    provide: ParticipantRepository,
    useClass: DynamoDbParticipantRepository,
  },
];

const services = [
  {
    provide: ParticipantRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
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
