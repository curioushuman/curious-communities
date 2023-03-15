import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';

import {
  GroupMemberMessage,
  GroupsQueueService,
} from '../../ports/groups.queue-service';

@Injectable()
export class FakeGroupsQueueService implements GroupsQueueService {
  constructor(public logger: LoggableLogger) {
    this.logger.setContext(FakeGroupsQueueService.name);
  }

  public updateGroupMembers = (
    messages: GroupMemberMessage[]
  ): TE.TaskEither<Error, void> => {
    messages.forEach((message) => {
      this.logger.debug(message, 'FakeGroupsQueueService.sendMessageBatch');
    });
    return TE.right(undefined);
  };
}
