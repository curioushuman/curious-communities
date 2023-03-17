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

  private prepareUpsertDto(
    participantSource: ParticipantSource
  ): UpsertParticipantRequestDto {
    return {
      participantSource:
        ParticipantSourceMapper.toResponseDto(participantSource),
    };
  }

  private prepareMessages = (
    participantSources: ParticipantSource[]
  ): UpsertParticipantRequestDto[] =>
    participantSources.map(this.prepareUpsertDto);

  public async upsert(
    requestDto: UpsertParticipantMultiRequestDto
  ): Promise<void> {
    // #1. validate dto
    const validDto = pipe(
      requestDto,
      parseData(UpsertParticipantMultiRequestDto.check, this.logger)
    );

    // #2. find the participantSources
    const participantSources = await this.findParticipantSources(validDto);

    const task = pipe(
      participantSources,
      // #3. prepare the messages
      this.prepareMessages,
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
