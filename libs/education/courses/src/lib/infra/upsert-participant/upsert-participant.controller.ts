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
    // #1. validate dto
    const validDto = pipe(
      requestDto,
      parseData(UpsertParticipantRequestDto.check, this.logger)
    );

    // #2. extract the participantSource
    const { participantSource } = validDto;

    const task = pipe(
      participantSource,
      // #3. send the messages
      this.orchestrationService.upsertParticipant
    );

    return executeTask(task);
  }
}
