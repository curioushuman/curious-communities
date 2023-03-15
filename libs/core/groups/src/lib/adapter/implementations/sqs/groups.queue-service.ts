import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { SqsService } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  GroupMemberMessage,
  GroupsQueueService,
} from '../../ports/groups.queue-service';

@Injectable()
export class SqsGroupsQueueService implements GroupsQueueService {
  private sqsService: SqsService<GroupMemberMessage>;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SqsGroupsQueueService.name);

    this.sqsService = new SqsService(
      {
        stackId: 'groups',
        prefix: 'cc',
      },
      this.logger
    );
  }

  public updateGroupMembers = (
    messages: GroupMemberMessage[]
  ): TE.TaskEither<Error, void> => {
    return this.sqsService.sendMessageBatch({
      id: 'group-member-update',
      messages,
    });
  };
}
