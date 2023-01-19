import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { UpdateParticipantRequestDto } from './dto/update-participant.request.dto';
import { UpdateParticipantCommand } from '../../application/commands/update-participant/update-participant.command';
import { ParticipantResponseDto } from '../dto/participant.response.dto';
import { ParticipantMapper } from '../participant.mapper';
import { ParticipantSource } from '../../domain/entities/participant-source';
import { FindParticipantMapper } from '../../application/queries/find-participant/find-participant.mapper';
import { FindParticipantQuery } from '../../application/queries/find-participant/find-participant.query';
import { Participant } from '../../domain/entities/participant';
import { UpdateParticipantDto } from '../../application/commands/update-participant/update-participant.dto';
import { FindParticipantSourceMapper } from '../../application/queries/find-participant-source/find-participant-source.mapper';
import { FindParticipantSourceQuery } from '../../application/queries/find-participant-source/find-participant-source.query';

/**
 * Controller for update participant operations
 *
 * NOTES
 * - we initially returned void for create/update actions
 *   see create controller for more info
 *
 * TODO
 * - [ ] should this actually be a service?
 * - [ ] should we be doing auth. here as well?
 *       OR is it ok that we're assuming it is done at higher levels?
 *       AKA it seems like a waste of resources to repeat the same task
 *       ONLY if auth. at this level differs from higher ups should we implement
 */

@Controller()
export class UpdateParticipantController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpdateParticipantController.name);
  }

  /**
   * TODO
   * - [ ] this could all be within fp-ts syntax
   *       I can't recall why I took it out (#2)
   */
  public async update(
    requestDto: UpdateParticipantRequestDto
  ): Promise<ParticipantResponseDto> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(UpdateParticipantRequestDto.check, this.logger)
    );

    // #2. find source and participant
    // NOTE: These will error if they need to
    // including NotFound for either
    const [participant, participantSource] = await Promise.all([
      this.findParticipant(validDto),
      this.findParticipantSource(validDto),
    ]);

    // set up the command dto
    const updateDto = {
      participant,
      participantSource,
    };

    const task = pipe(
      updateDto,

      // #3. validate the dto
      // NOTE: this will also occur in the command itself
      // but the Runtype.check function is such a useful way to
      // also make sure the types are correct. Better than typecasting
      parseActionData(
        UpdateParticipantDto.check,
        this.logger,
        'SourceInvalidError'
      ),

      // #4. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateParticipantCommand(commandDto);
            return await this.commandBus.execute<UpdateParticipantCommand>(
              command
            );
          },
          (error: unknown) => error as Error
        )
      ),

      // #5. transform to the response DTO
      TE.chain(parseActionData(ParticipantMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }

  private findParticipant(
    requestDto: UpdateParticipantRequestDto
  ): Promise<Participant> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindParticipantMapper.fromUpdateParticipantRequestDto,
        this.logger
      ),

      // #2. call the query
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindParticipantQuery(findDto);
              return await this.queryBus.execute<FindParticipantQuery>(query);
            },
            (error: unknown) => error as Error
          )
        )
      )
    );

    return executeTask(task);
  }

  private findParticipantSource(
    requestDto: UpdateParticipantRequestDto
  ): Promise<ParticipantSource> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindParticipantSourceMapper.fromUpdateParticipantRequestDto,
        this.logger
      ),

      // #2. call the query
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindParticipantSourceQuery(findDto);
              return await this.queryBus.execute<FindParticipantSourceQuery>(
                query
              );
            },
            (error: unknown) => error as Error
          )
        )
      )
    );

    return executeTask(task);
  }
}
