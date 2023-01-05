import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  FindByIdParticipantRequestDto,
  FindByIdSourceValueParticipantRequestDto,
  FindParticipantRequestDto,
} from './dto/find-participant.request.dto';
import { FindParticipantMapper } from '../../application/queries/find-participant/find-participant.mapper';
import { FindParticipantQuery } from '../../application/queries/find-participant/find-participant.query';
import { ParticipantResponseDto } from '../dto/participant.response.dto';
import { ParticipantMapper } from '../participant.mapper';

/**
 * Controller for find participant operations
 */

@Controller()
export class FindParticipantController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(FindParticipantController.name);
  }

  public async find(
    requestDto: FindParticipantRequestDto
  ): Promise<ParticipantResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindParticipantRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(FindParticipantMapper.fromFindRequestDto, this.logger)
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindParticipantQuery(queryDto);
            return await this.queryBus.execute<FindParticipantQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(
        parseActionData(ParticipantMapper.toParticipantResponseDto, this.logger)
      )
    );

    return executeTask(task);
  }

  public async findById(
    requestDto: FindByIdParticipantRequestDto
  ): Promise<ParticipantResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindByIdParticipantRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(
          FindParticipantMapper.fromFindByIdRequestDto,
          this.logger
        )
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindParticipantQuery(queryDto);
            return await this.queryBus.execute<FindParticipantQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(
        parseActionData(ParticipantMapper.toParticipantResponseDto, this.logger)
      )
    );

    return executeTask(task);
  }

  public async findByIdSourceValue(
    requestDto: FindByIdSourceValueParticipantRequestDto
  ): Promise<ParticipantResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(
        FindByIdSourceValueParticipantRequestDto.check,
        this.logger
      ),

      // #2. transform the dto
      TE.chain(
        parseActionData(
          FindParticipantMapper.fromFindByIdSourceValueRequestDto,
          this.logger
        )
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindParticipantQuery(queryDto);
            return await this.queryBus.execute<FindParticipantQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(
        parseActionData(ParticipantMapper.toParticipantResponseDto, this.logger)
      )
    );

    return executeTask(task);
  }
}
