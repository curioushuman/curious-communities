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

import { UpsertGroupSourceRequestDto } from './dto/upsert-group-source.request.dto';
import { CreateGroupSourceMapper } from '../../application/commands/create-group-source/create-group-source.mapper';
import { CreateGroupSourceCommand } from '../../application/commands/create-group-source/create-group-source.command';
import { UpdateGroupSourceMapper } from '../../application/commands/update-group-source/update-group-source.mapper';
import { UpdateGroupSourceCommand } from '../../application/commands/update-group-source/update-group-source.command';
import { FindGroupSourceMapper } from '../../application/queries/find-group-source/find-group-source.mapper';
import { FindGroupSourceQuery } from '../../application/queries/find-group-source/find-group-source.query';
import { GroupSource } from '../../domain/entities/group-source';
import {
  RepositoryItemNotFoundError,
  RepositoryItemUpdateError,
} from '@curioushuman/error-factory';
import { GroupSourceMapper } from '../group-source.mapper';
import {
  prepareUpsertResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';

/**
 * Controller for upsert group operations
 */

@Controller()
export class UpsertGroupSourceController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpsertGroupSourceController.name);
  }

  /**
   * This will look for a groupSource at the relevant source
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
   */
  public async upsert(
    requestDto: UpsertGroupSourceRequestDto
  ): Promise<ResponsePayload<'group-source'>> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(UpsertGroupSourceRequestDto.check, this.logger)
    );

    // #2. find groupSource or undefined
    // NOTE: These will error if they need to
    const groupSource = await this.find(validDto);

    // #3. upsert group member source
    const upsertTask = groupSource
      ? this.updateGroupSource(validDto, groupSource)
      : this.createGroupSource(validDto);
    const upsertedGroupSource = await executeTask(upsertTask);
    // we know that at this point, groupSource would exist
    const payload = upsertedGroupSource || (groupSource as GroupSource);

    // #4. return the response
    return pipe(
      payload,
      parseData(GroupSourceMapper.toResponseDto, this.logger),
      prepareUpsertResponsePayload(
        'group-source',
        !!groupSource,
        groupSource && !upsertedGroupSource
      )
    );
  }

  private createGroupSource(
    validDto: UpsertGroupSourceRequestDto
  ): TE.TaskEither<Error, GroupSource> {
    return pipe(
      validDto,
      parseActionData(
        CreateGroupSourceMapper.fromUpsertRequestDto,
        this.logger
      ),
      TE.chain((createDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateGroupSourceCommand(createDto);
            return await this.commandBus.execute<CreateGroupSourceCommand>(
              command
            );
          },
          (error: unknown) => error as Error
        )
      )
    );
  }

  private updateGroupSource(
    validDto: UpsertGroupSourceRequestDto,
    groupSource: GroupSource
  ): TE.TaskEither<Error, GroupSource | undefined> {
    return pipe(
      validDto,
      parseActionData(
        UpdateGroupSourceMapper.fromUpsertRequestDto(groupSource),
        this.logger
      ),
      TE.chain((updateDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateGroupSourceCommand(updateDto);
            return await this.commandBus.execute<UpdateGroupSourceCommand>(
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
    requestDto: UpsertGroupSourceRequestDto
  ): Promise<GroupSource | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform the dto
      // NOTE: it is within this mapper function that we look for idSource, if not email
      parseActionData(FindGroupSourceMapper.fromUpsertRequestDto, this.logger),

      // #2. find the groupSource
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindGroupSourceQuery(findDto);
              return await this.queryBus.execute<FindGroupSourceQuery>(query);
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
