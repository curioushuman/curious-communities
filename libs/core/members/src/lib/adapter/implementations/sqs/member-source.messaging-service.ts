import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { SqsService } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  MemberSourceMessage,
  MemberSourceMessagingService,
} from '../../ports/member-source.messaging-service';

@Injectable()
export class SqsMemberSourceMessagingService
  implements MemberSourceMessagingService
{
  private sqsService: SqsService<MemberSourceMessage>;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SqsMemberSourceMessagingService.name);

    this.sqsService = new SqsService(
      {
        stackId: 'members',
        prefix: 'cc',
      },
      this.logger
    );
  }

  public upsertMembers = (
    messages: MemberSourceMessage[]
  ): TE.TaskEither<Error, void> => {
    return this.sqsService.sendMessageBatch({
      id: 'member-source-upsert',
      messages,
    });
  };
}
