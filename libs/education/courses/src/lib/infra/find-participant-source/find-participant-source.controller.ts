import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { FindParticipantSourceRequestDto } from './dto/find-participant-source.request.dto';
import { FindParticipantSourceMapper } from '../../application/queries/find-participant-source/find-participant-source.mapper';
import { FindParticipantSourceQuery } from '../../application/queries/find-participant-source/find-participant-source.query';
import { ParticipantSourceResponseDto } from '../dto/participant-source.response.dto';
import { ParticipantSourceMapper } from '../participant-source.mapper';

/**
 * Controller for find participant operations
 */

@Controller()
export class FindParticipantSourceController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(FindParticipantSourceController.name);
  }

  public async find(
    requestDto: FindParticipantSourceRequestDto
  ): Promise<ParticipantSourceResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindParticipantSourceRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(
          FindParticipantSourceMapper.fromFindRequestDto,
          this.logger
        )
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindParticipantSourceQuery(queryDto);
            return await this.queryBus.execute<FindParticipantSourceQuery>(
              query
            );
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(
        parseActionData(ParticipantSourceMapper.toResponseDto, this.logger)
      )
    );

    return executeTask(task);
  }
}
