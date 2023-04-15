import { Controller } from '@nestjs/common';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantOrchestrationService } from '../../adapter/ports/participant.orchestration-service';
import { UpsertParticipantRequestDto } from './dto/upsert-participant.request.dto';

/**
 * Controller to handle updating multiple participants
 *
 * TODO:
 * - [ ] whole thing could be done in fp-ts
 */
@Controller()
export class UpsertParticipantController {
  constructor(
    private logger: LoggableLogger,
    private orchestrationService: ParticipantOrchestrationService
  ) {
    this.logger.setContext(UpsertParticipantController.name);
  }

  public async upsert(requestDto: UpsertParticipantRequestDto): Promise<void> {
    const validDto = pipe(
      requestDto,
      parseData(UpsertParticipantRequestDto.check, this.logger)
    );

    const task = pipe(validDto, this.orchestrationService.upsertParticipant);

    return executeTask(task);
  }
}
