import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { SfnService, prepareExternalIdSourceValue } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantOrchestrationService } from '../../ports/participant.orchestration-service';
import { UpsertParticipantRequestDto } from '../../../infra/upsert-participant/dto/upsert-participant.request.dto';

@Injectable()
export class SfnParticipantOrchestrationService
  implements ParticipantOrchestrationService
{
  private sfnService: SfnService;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SfnParticipantOrchestrationService.name);

    this.sfnService = new SfnService(
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
    dto: UpsertParticipantRequestDto
  ): TE.TaskEither<Error, void> => {
    const participantIdSourceValue = prepareExternalIdSourceValue(
      dto.participantSource.id,
      dto.participantSource.source
    );
    return this.sfnService.startExecution({
      id: 'participant-upsert-orch-sfn',
      input: {
        ...dto,
        // we still need this in the step function as we use it to check for participant
        participantIdSourceValue,
      },
    });
  };
}
