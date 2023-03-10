import { INestApplicationContext, Module } from '@nestjs/common';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { UpsertParticipantController } from './infra/upsert-participant/upsert-participant.controller';
import { ParticipantOrchestrationService } from './adapter/ports/participant.orchestration-service';
import { SfnParticipantOrchestrationService } from './adapter/implementations/sfn/participant.orchestration-service';

const imports = [LoggableModule];

const controllers = [UpsertParticipantController];

const services = [
  {
    provide: ParticipantOrchestrationService,
    useClass: SfnParticipantOrchestrationService,
  },
];

@Module({
  imports: [...imports],
  controllers: [...controllers],
  providers: [...services],
  exports: [],
})
export class UpsertParticipantModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
