import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';
import { ParticipantRepository } from './adapter/ports/participant.repository';
import { DynamoDbParticipantRepository } from './adapter/implementations/dynamodb/participant.repository';
import { ParticipantRepositoryErrorFactory } from './adapter/ports/participant.repository.error-factory';
import { UpdateParticipantMultiController } from './infra/update-participant-multi/update-participant-multi.controller';
import { CoursesQueueService } from './adapter/ports/courses.queue-service';
import { SqsCoursesQueueService } from './adapter/implementations/sqs/courses.queue-service';
import { FindParticipantsHandler } from './application/queries/find-participants/find-participants.query';

const imports = [CqrsModule, LoggableModule];

const controllers = [UpdateParticipantMultiController];

const handlers = [FindParticipantsHandler];

const repositories = [
  {
    provide: ParticipantRepository,
    useClass: DynamoDbParticipantRepository,
  },
];

const services = [
  {
    provide: CoursesQueueService,
    useClass: SqsCoursesQueueService,
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
