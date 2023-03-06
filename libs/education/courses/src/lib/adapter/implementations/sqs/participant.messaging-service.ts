import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { SqsService, SqsServiceProps } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  ParticipantMessage,
  ParticipantMessagingService,
} from '../../ports/participant.messaging-service';

@Injectable()
export class SqsParticipantMessagingService
  implements ParticipantMessagingService
{
  private sqsService: SqsService;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SqsParticipantMessagingService.name);

    const props: SqsServiceProps = {
      queueId: 'participant-update',
      prefix: 'cc',
    };
    this.sqsService = new SqsService(props, this.logger);
  }

  public sendMessageBatch = (
    messages: ParticipantMessage[]
  ): TE.TaskEither<Error, void> => {
    return pipe(
      this.sqsService.prepareMessages(messages),
      this.sqsService.sendMessageBatch
    );
  };
}
