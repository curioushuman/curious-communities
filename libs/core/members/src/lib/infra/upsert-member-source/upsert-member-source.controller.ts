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
import {
  RepositoryItemNotFoundError,
  RepositoryItemUpdateError,
} from '@curioushuman/error-factory';

import { UpsertMemberSourceRequestDto } from './dto/upsert-member-source.request.dto';
import { CreateMemberSourceMapper } from '../../application/commands/create-member-source/create-member-source.mapper';
import { CreateMemberSourceCommand } from '../../application/commands/create-member-source/create-member-source.command';
import { UpdateMemberSourceMapper } from '../../application/commands/update-member-source/update-member-source.mapper';
import { UpdateMemberSourceCommand } from '../../application/commands/update-member-source/update-member-source.command';
import { MemberSourceMapper } from '../member-source.mapper';
import { FindMemberSourceMapper } from '../../application/queries/find-member-source/find-member-source.mapper';
import { FindMemberSourceQuery } from '../../application/queries/find-member-source/find-member-source.query';
import { MemberSource } from '../../domain/entities/member-source';
import {
  prepareUpsertResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';

/**
 * Controller for upsert member operations
 */

@Controller()
export class UpsertMemberSourceController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpsertMemberSourceController.name);
  }

  /**
   * This will look for a memberSource at the relevant source
   * If it finds one, it will update it
   * If it doesn't find one, it will create it
   *
   * NOTES:
   * When using fp-ts each function is stateless, i.e. a perfect function.
   * So, you cannot ask it to perform functions/methods from classes/objects that
   * rely on state. There including this.find in step #2 fails as it relies on
   * this.logger and this.queryBusy, step 3 relies on this.commandBus.
   *
   * So, we perform the find action first and separately; it'll error if it needs to.
   * Then we pipe that result into the rest of the function.
   *
   * TODO
   * - [ ] at some point extract the update and create into a single, simpler, static function
   */
  public async upsert(
    requestDto: UpsertMemberSourceRequestDto
  ): Promise<ResponsePayload<'member-source'>> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(UpsertMemberSourceRequestDto.check, this.logger)
    );

    // #2. find memberSource or undefined
    // NOTE: These will error if they need to
    const memberSource = await this.find(validDto);

    // #3. upsert member member source
    const upsertTask = memberSource
      ? this.updateMemberSource(validDto, memberSource)
      : this.createMemberSource(validDto);
    const upsertedMemberSource = await executeTask(upsertTask);
    // we know that at this point, memberSource would exist
    const payload = upsertedMemberSource || (memberSource as MemberSource);

    // #4. return the response
    return pipe(
      payload,
      parseData(MemberSourceMapper.toResponseDto, this.logger),
      prepareUpsertResponsePayload(
        'member-source',
        !!memberSource,
        memberSource && !upsertedMemberSource
      )
    );
  }

  private createMemberSource(
    validDto: UpsertMemberSourceRequestDto
  ): TE.TaskEither<Error, MemberSource> {
    return pipe(
      validDto,
      parseActionData(
        CreateMemberSourceMapper.fromUpsertRequestDto,
        this.logger
      ),
      TE.chain((createDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateMemberSourceCommand(createDto);
            return await this.commandBus.execute<CreateMemberSourceCommand>(
              command
            );
          },
          (error: unknown) => error as Error
        )
      )
    );
  }

  private updateMemberSource(
    validDto: UpsertMemberSourceRequestDto,
    memberSource: MemberSource
  ): TE.TaskEither<Error, MemberSource | undefined> {
    return pipe(
      validDto,
      parseActionData(
        UpdateMemberSourceMapper.fromUpsertRequestDto(memberSource),
        this.logger
      ),
      TE.chain((updateDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateMemberSourceCommand(updateDto);
            return await this.commandBus.execute<UpdateMemberSourceCommand>(
              command
            );
          },
          (error: unknown) => error as Error
        )
      ),

      // Catch the update error specifically
      // try/catch doesn't seem to work in lambda handler
      // so instead of throwing this error, we're returning undefined
      // to indicate to lambda to not continue with lambda level flows
      // TODO: this is a bit of a hack, need to figure out a better way
      TE.orElse((err) => {
        return err instanceof RepositoryItemUpdateError
          ? TE.right(undefined)
          : TE.left(err);
      })
    );
  }

  private find(
    requestDto: UpsertMemberSourceRequestDto
  ): Promise<MemberSource | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform the dto
      // NOTE: it is within this mapper function that we look for idSource, if not email
      parseActionData(FindMemberSourceMapper.fromUpsertRequestDto, this.logger),

      // #2. find the memberSource
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindMemberSourceQuery(findDto);
              return await this.queryBus.execute<FindMemberSourceQuery>(query);
            },
            (error: unknown) => error as Error
          ),
          // check if it's a notFound error just return undefined
          // otherwise, continue on the left path with the error
          TE.orElse((err) => {
            return err instanceof RepositoryItemNotFoundError
              ? TE.right(undefined)
              : TE.left(err);
          })
        )
      )
    );

    return executeTask(task);
  }
}
