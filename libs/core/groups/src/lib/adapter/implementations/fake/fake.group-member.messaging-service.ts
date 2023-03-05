import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';

import {
  GroupMemberMessage,
  GroupMemberMessagingService,
} from '../../ports/group-member.messaging-service';

@Injectable()
export class FakeGroupMemberMessagingService
  implements GroupMemberMessagingService
{
  constructor(public logger: LoggableLogger) {
    this.logger.setContext(FakeGroupMemberMessagingService.name);
  }

  public sendMessageBatch = (
    messages: GroupMemberMessage[]
  ): TE.TaskEither<Error, void> => {
    messages.forEach((message) => {
      this.logger.debug(
        message,
        'FakeGroupMemberMessagingService.sendMessageBatch'
      );
    });
    return TE.right(undefined);
  };
}
