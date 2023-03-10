import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';

import {
  GroupMemberMessage,
  GroupMemberQueueService,
} from '../../ports/group-member.queue-service';

@Injectable()
export class FakeGroupMemberQueueService implements GroupMemberQueueService {
  constructor(public logger: LoggableLogger) {
    this.logger.setContext(FakeGroupMemberQueueService.name);
  }

  public updateGroupMembers = (
    messages: GroupMemberMessage[]
  ): TE.TaskEither<Error, void> => {
    messages.forEach((message) => {
      this.logger.debug(
        message,
        'FakeGroupMemberQueueService.sendMessageBatch'
      );
    });
    return TE.right(undefined);
  };
}
