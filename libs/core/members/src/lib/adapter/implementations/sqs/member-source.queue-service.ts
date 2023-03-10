import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { SqsService } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  MemberSourceMessage,
  MemberSourceQueueService,
} from '../../ports/member-source.queue-service';

@Injectable()
export class SqsMemberSourceQueueService implements MemberSourceQueueService {
  private sqsService: SqsService<MemberSourceMessage>;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SqsMemberSourceQueueService.name);

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
