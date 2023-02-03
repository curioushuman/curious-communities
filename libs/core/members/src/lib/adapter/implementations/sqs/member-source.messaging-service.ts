import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { SqsService, SqsServiceProps } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  MemberSourceMessage,
  MemberSourceMessagingService,
} from '../../ports/member-source.messaging-service';

@Injectable()
export class SqsMemberSourceMessagingService
  implements MemberSourceMessagingService
{
  private sqsService: SqsService;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SqsMemberSourceMessagingService.name);

    const props: SqsServiceProps = {
      queueId: 'members-member-source-upsert',
      prefix: 'cc',
    };
    this.sqsService = new SqsService(props, this.logger);
  }

  public sendMessageBatch = (
    messages: MemberSourceMessage[]
  ): TE.TaskEither<Error, void> => {
    return pipe(
      this.sqsService.prepareMessages(messages),
      this.sqsService.sendMessageBatch
    );
  };
}
