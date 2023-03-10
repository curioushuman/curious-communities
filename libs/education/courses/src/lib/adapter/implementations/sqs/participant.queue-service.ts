import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { SqsService } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  ParticipantMessage,
  ParticipantQueueService,
} from '../../ports/participant.queue-service';
import { UpdateParticipantRequestDto } from '../../../infra/update-participant/dto/update-participant.request.dto';
import { UpsertParticipantRequestDto } from '../../../infra/upsert-participant/dto/upsert-participant.request.dto';

@Injectable()
export class SqsParticipantQueueService implements ParticipantQueueService {
  private sqsService: SqsService<ParticipantMessage>;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SqsParticipantQueueService.name);

    this.sqsService = new SqsService(
      {
        stackId: 'courses',
        prefix: 'cc',
      },
      this.logger
    );
  }

  public updateParticipants = (
    messages: UpdateParticipantRequestDto[]
  ): TE.TaskEither<Error, void> => {
    return this.sqsService.sendMessageBatch({
      id: 'participant-update',
      messages,
    });
  };

  public upsertParticipants = (
    messages: UpsertParticipantRequestDto[]
  ): TE.TaskEither<Error, void> => {
    return this.sqsService.sendMessageBatch({
      id: 'participant-upsert',
      messages,
    });
  };
}
