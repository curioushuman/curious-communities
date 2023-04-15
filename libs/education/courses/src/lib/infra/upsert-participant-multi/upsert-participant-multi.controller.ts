import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CoursesQueueService } from '../../adapter/ports/courses.queue-service';
import { UpsertParticipantMultiRequestDto } from './dto/upsert-participant-multi.request.dto';
import { UpsertParticipantRequestDto } from '../upsert-participant/dto/upsert-participant.request.dto';
import { ParticipantSource } from '../../domain/entities/participant-source';
import { FindParticipantSourcesMapper } from '../../application/queries/find-participant-sources/find-participant-sources.mapper';
import { FindParticipantSourcesQuery } from '../../application/queries/find-participant-sources/find-participant-sources.query';
import { ParticipantSourceMapper } from '../participant-source.mapper';
import { CourseBaseResponseDto } from '../dto/course.response.dto';

/**
 * Controller to handle updating multiple participants
 *
 * TODO:
 * - [ ] whole thing could be done in fp-ts
 */
@Controller()
export class UpsertParticipantMultiController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus,
    private queueService: CoursesQueueService
  ) {
    this.logger.setContext(UpsertParticipantMultiController.name);
  }

  /**
   * Construct an UpsertParticipantRequestDto for each participantSource
   */
  private prepareMessages = (
    course: CourseBaseResponseDto
  ): ((
    participantSources: ParticipantSource[]
  ) => UpsertParticipantRequestDto[]) => {
    return (participantSources) =>
      participantSources.map((participantSource) => ({
        participantSource:
          ParticipantSourceMapper.toResponseDto(participantSource),
        course,
      }));
  };

  public async upsert(
    requestDto: UpsertParticipantMultiRequestDto
  ): Promise<void> {
    // #1. validate dto
    const validDto = pipe(
      requestDto,
      parseData(UpsertParticipantMultiRequestDto.check, this.logger)
    );
    const { course } = validDto;

    // #2. find the participantSources
    const participantSources = await this.findParticipantSources(validDto);

    const task = pipe(
      participantSources,
      // #3. prepare the messages
      this.prepareMessages(course),
      // #4. send the messages
      this.queueService.upsertParticipants
    );

    return executeTask(task);
  }

  /**
   * This obtains ALL participantSources
   *
   * For now, we're not going to deal with paging
   */
  private findParticipantSources(
    validDto: UpsertParticipantMultiRequestDto
  ): Promise<ParticipantSource[]> {
    const task = pipe(
      validDto,

      // #1. transform dto
      parseActionData(
        FindParticipantSourcesMapper.fromUpsertParticipantMultiRequestDto,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. call the query
      TE.chain((findDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindParticipantSourcesQuery(findDto);
            return await this.queryBus.execute<FindParticipantSourcesQuery>(
              query
            );
          },
          (error: unknown) => error as Error
        )
      ),
      TE.map((restApiResponse) => restApiResponse.items)
    );

    return executeTask(task);
  }
}
