import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { SqsService } from '@curioushuman/common';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CoursesMessage,
  CoursesQueueService,
} from '../../ports/courses.queue-service';
import { UpdateParticipantRequestDto } from '../../../infra/update-participant/dto/update-participant.request.dto';
import { UpsertParticipantRequestDto } from '../../../infra/upsert-participant/dto/upsert-participant.request.dto';
import { UpdateCourseRequestDto } from '../../../infra/update-course/dto/update-course.request.dto';

@Injectable()
export class SqsCoursesQueueService implements CoursesQueueService {
  private sqsService: SqsService<CoursesMessage>;

  constructor(public logger: LoggableLogger) {
    this.logger.setContext(SqsCoursesQueueService.name);

    this.sqsService = new SqsService(
      {
        stackId: 'courses',
        prefix: 'cc',
      },
      this.logger
    );
  }

  public updateCourses = (
    messages: UpdateCourseRequestDto[]
  ): TE.TaskEither<Error, void> => {
    return this.sqsService.sendMessageBatch({
      id: 'course-update',
      messages,
      queueType: 'throttled-destinations',
    });
  };

  public updateParticipants = (
    messages: UpdateParticipantRequestDto[]
  ): TE.TaskEither<Error, void> => {
    return this.sqsService.sendMessageBatch({
      id: 'participant-update',
      messages,
      queueType: 'throttled-destinations',
    });
  };

  public upsertParticipants = (
    messages: UpsertParticipantRequestDto[]
  ): TE.TaskEither<Error, void> => {
    return this.sqsService.sendMessageBatch({
      id: 'participant-upsert',
      messages,
    });
  };
}
