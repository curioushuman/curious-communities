import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { SqsService } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  GroupMemberMessage,
  GroupMemberMessagingService,
} from '../../ports/group-member.messaging-service';

@Injectable()
export class SqsGroupMemberMessagingService
  implements GroupMemberMessagingService
{
  private sqsService: SqsService<GroupMemberMessage>;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SqsGroupMemberMessagingService.name);

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
