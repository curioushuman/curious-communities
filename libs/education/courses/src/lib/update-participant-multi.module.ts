import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';
import { FindParticipantHandler } from './application/queries/find-participant/find-participant.query';
import { ParticipantRepository } from './adapter/ports/participant.repository';
import { DynamoDbParticipantRepository } from './adapter/implementations/dynamodb/participant.repository';
import { ParticipantRepositoryErrorFactory } from './adapter/ports/participant.repository.error-factory';
import { UpdateParticipantMultiController } from './infra/update-participant-multi/update-participant-multi.controller';
import { ParticipantQueueService } from './adapter/ports/participant.queue-service';
import { SqsParticipantQueueService } from './adapter/implementations/sqs/participant.queue-service';

const imports = [CqrsModule, LoggableModule];

const controllers = [UpdateParticipantMultiController];

const handlers = [FindParticipantHandler];

const repositories = [
  {
    provide: ParticipantRepository,
    useClass: DynamoDbParticipantRepository,
  },
];

const services = [
  {
    provide: ParticipantQueueService,
    useClass: SqsParticipantQueueService,
  },
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
export class UpdateParticipantMultiModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
