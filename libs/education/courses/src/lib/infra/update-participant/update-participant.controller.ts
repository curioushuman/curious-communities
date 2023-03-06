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
import { RepositoryItemUpdateError } from '@curioushuman/error-factory';
import { RequestSourceEnum } from '@curioushuman/common';

import {
  parseUpdateParticipantRequestDto,
  UpdateParticipantRequestDto,
} from './dto/update-participant.request.dto';
import { UpdateParticipantCommand } from '../../application/commands/update-participant/update-participant.command';
import { ParticipantMapper } from '../participant.mapper';
import { ParticipantSource } from '../../domain/entities/participant-source';
import { FindParticipantMapper } from '../../application/queries/find-participant/find-participant.mapper';
import { FindParticipantQuery } from '../../application/queries/find-participant/find-participant.query';
import { Participant } from '../../domain/entities/participant';
import {
  parseUpdateParticipantDto,
  UpdateParticipantDto,
} from '../../application/commands/update-participant/update-participant.dto';
import { FindParticipantSourceMapper } from '../../application/queries/find-participant-source/find-participant-source.mapper';
import { FindParticipantSourceQuery } from '../../application/queries/find-participant-source/find-participant-source.query';
import {
  prepareUpsertResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';

/**
 * Controller for update participant operations
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
   * Public method to update a participant
   *
   * TODO:
   * - [ ] whole thing could be done in fp-ts
   */
  public async update(
    requestDto: UpdateParticipantRequestDto
  ): Promise<ResponsePayload<'participant'>> {
    // log the dto
    this.logger.debug(requestDto, 'update');

    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(parseUpdateParticipantRequestDto, this.logger)
    );

    // here we determine which route to take
    // update via source or update via participant
    const participantDto = validDto.participant;
    let participant: Participant;
    let participantSource: ParticipantSource | undefined = undefined;
    if (participantDto) {
      participant = pipe(
        participantDto,
        parseData(ParticipantMapper.fromResponseDto, this.logger)
      );
      if (validDto.requestSource !== RequestSourceEnum.INTERNAL) {
        // this is purely a check, we're not going to use the value
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const participantExists = await this.findParticipantById(validDto);
      }
    } else {
      [participant, participantSource] = await Promise.all([
        this.findParticipant(validDto),
        this.findParticipantSource(validDto),
      ]);
    }

    // ? should the comparison of source to participant be done here?

    // set up the command dto
    const updateDto = {
      participant,
      participantSource,
    } as UpdateParticipantDto;

    // #3. execute the command
    const updatedParticipant = await this.updateParticipant(updateDto);

    // #4. return the response
    let payload = pipe(
      participant,
      parseData(ParticipantMapper.toResponseDto, this.logger)
    );
    if (updatedParticipant) {
      payload = pipe(
        updatedParticipant,
        parseData(ParticipantMapper.toResponseDto, this.logger)
      );
    }

    return pipe(
      payload,
      prepareUpsertResponsePayload('participant', true, !updatedParticipant)
    );
  }

  private updateParticipant(
    updateDto: UpdateParticipantDto
  ): Promise<Participant> {
    const task = pipe(
      updateDto,

      // #1. validate the command dto
      // NOTE: this will also occur in the command itself
      // but the Runtype.check function is such a useful way to
      // also make sure the types are correct. Better than typecasting
      parseActionData(parseUpdateParticipantDto, this.logger),

      // #2. call the command
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

      // #3. catch the update error specifically
      TE.orElse((err) => {
        return err instanceof RepositoryItemUpdateError
          ? TE.right(undefined)
          : TE.left(err);
      })
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
        TE.tryCatch(
          async () => {
            const query = new FindParticipantQuery(findDto);
            return await this.queryBus.execute<FindParticipantQuery>(query);
          },
          (error: unknown) => error as Error
        )
      )
    );

    return executeTask(task);
  }

  private findParticipantById(
    validDto: UpdateParticipantRequestDto
  ): Promise<Participant> {
    const task = pipe(
      validDto,

      // #1. transform dto
      parseActionData(
        FindParticipantMapper.fromUpdateParticipantRequestDto,
        this.logger
      ),

      // #2. call the query
      TE.chain((findDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindParticipantQuery(findDto);
            return await this.queryBus.execute<FindParticipantQuery>(query);
          },
          (error: unknown) => error as Error
        )
      )
    );

    return executeTask(task);
  }

  private findParticipantSource(
    validDto: UpdateParticipantRequestDto
  ): Promise<ParticipantSource> {
    const task = pipe(
      validDto,

      // #1. transform dto
      parseActionData(
        FindParticipantSourceMapper.fromUpdateParticipantRequestDto,
        this.logger
      ),

      // #2. call the query
      TE.chain((findDto) =>
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
    );

    return executeTask(task);
  }
}
