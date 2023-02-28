import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';

import { ParticipantRepository } from './adapter/ports/participant.repository';
import { CreateParticipantHandler } from './application/commands/create-participant/create-participant.command';
import { CreateParticipantController } from './infra/create-participant/create-participant.controller';
import { ParticipantRepositoryErrorFactory } from './adapter/ports/participant.repository.error-factory';
import { DynamoDbParticipantRepository } from './adapter/implementations/dynamodb/participant.repository';

const imports = [CqrsModule, LoggableModule];

const controllers = [CreateParticipantController];

const handlers = [CreateParticipantHandler];

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
  imports: [...imports],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class CreateParticipantModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
