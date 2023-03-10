import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { SqsService } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  ParticipantMessage,
  ParticipantMessagingService,
} from '../../ports/participant.messaging-service';
import { UpdateParticipantRequestDto } from '../../../infra/update-participant/dto/update-participant.request.dto';
import { UpsertParticipantRequestDto } from '../../../infra/upsert-participant/dto/upsert-participant.request.dto';

@Injectable()
export class SqsParticipantMessagingService
  implements ParticipantMessagingService
{
  private sqsService: SqsService<ParticipantMessage>;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SqsParticipantMessagingService.name);

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
