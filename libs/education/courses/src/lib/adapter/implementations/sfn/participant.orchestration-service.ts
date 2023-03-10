import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { prepareExternalIdSourceValue, SfnService } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantOrchestrationService } from '../../ports/participant.orchestration-service';
import { ParticipantSource } from '../../../domain/entities/participant-source';

@Injectable()
export class SfnParticipantOrchestrationService
  implements ParticipantOrchestrationService
{
  private sqsService: SfnService;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SfnParticipantOrchestrationService.name);

    this.sqsService = new SfnService(
      {
        stackId: 'courses',
        prefix: 'cc',
      },
      this.logger
    );
  }

  /**
   * NOTE: at this time we're handing both the full pS and the idSourceValue
   * to the state machine. This is because the state machine is currently using idSourceValue.
   * But we'd prefer it to use the full pS. So we're passing both for now.
   */
  public upsertParticipant = (
    participantSource: ParticipantSource
  ): TE.TaskEither<Error, void> => {
    const participantIdSourceValue = prepareExternalIdSourceValue(
      participantSource.id,
      participantSource.source
    );
    return this.sqsService.startExecution({
      id: 'participant-upsert',
      input: {
        participantSource,
        participantIdSourceValue,
      },
    });
  };
}
