import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { SqsService, SqsServiceProps } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  GroupMemberMessage,
  GroupMemberMessagingService,
} from '../../ports/group-member.messaging-service';

@Injectable()
export class SqsGroupMemberMessagingService
  implements GroupMemberMessagingService
{
  private sqsService: SqsService;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SqsGroupMemberMessagingService.name);

    const props: SqsServiceProps = {
      queueId: 'group-member-update',
      prefix: 'cc',
    };
    this.sqsService = new SqsService(props, this.logger);
  }

  public sendMessageBatch = (
    messages: GroupMemberMessage[]
  ): TE.TaskEither<Error, void> => {
    return pipe(
      this.sqsService.prepareMessages(messages),
      this.sqsService.sendMessageBatch
    );
  };
}
