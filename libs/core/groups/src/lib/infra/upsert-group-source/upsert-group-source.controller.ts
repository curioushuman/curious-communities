import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { UpsertGroupSourceRequestDto } from './dto/upsert-group-source.request.dto';
import { CreateGroupSourceMapper } from '../../application/commands/create-group-source/create-group-source.mapper';
import { CreateGroupSourceCommand } from '../../application/commands/create-group-source/create-group-source.command';
import { UpdateGroupSourceMapper } from '../../application/commands/update-group-source/update-group-source.mapper';
import { UpdateGroupSourceCommand } from '../../application/commands/update-group-source/update-group-source.command';
import { GroupSourceResponseDto } from '../dto/group-source.response.dto';
import { GroupSourceMapper } from '../group-source.mapper';
import { FindGroupSourceMapper } from '../../application/queries/find-group-source/find-group-source.mapper';
import { FindGroupSourceQuery } from '../../application/queries/find-group-source/find-group-source.query';
import { GroupSource } from '../../domain/entities/group-source';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';

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
   *
   * TODO
   * - [ ] at some point extract the update and create into a single, simpler, static function
   */
  public async upsert(
    requestDto: UpsertGroupSourceRequestDto
  ): Promise<GroupSourceResponseDto> {
    // find will
    // - validate dto
    // - find groupSource or undefined
    const groupSource = await this.find(requestDto);
    const task = pipe(
      groupSource,

      // #1. parse the dto
      // handled in find

      // #2. see if you can find a groupSource
      // handled in find

      // #3. based on whether or not we find anything, take the appropriate action
      // groupSource could be null
      O.fromNullable,
      O.fold(
        // if it is, then create
        () =>
          pipe(
            requestDto,
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
          ),
        // otherwise update
        (ms) =>
          pipe(
            requestDto,
            parseActionData(
              UpdateGroupSourceMapper.fromUpsertRequestDto(ms),
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
            )
          )
      ),

      // #5. transform to the response DTO
      TE.chain(parseActionData(GroupSourceMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }

  private find(
    requestDto: UpsertGroupSourceRequestDto
  ): Promise<GroupSource | undefined> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(UpsertGroupSourceRequestDto.check, this.logger),

      // #2. transform the dto
      // NOTE: if no idSource for this source exists, this will return undefined
      TE.chain((dto) =>
        pipe(
          dto,
          parseActionData(
            FindGroupSourceMapper.fromUpsertRequestDto,
            this.logger
          )
        )
      ),

      TE.chain((findDto) =>
        pipe(
          findDto,
          // because dto might be undefined
          O.fromNullable,
          O.fold(
            // if it is, simply return undefined
            () => TE.right(undefined),
            (dto) =>
              pipe(
                TE.tryCatch(
                  async () => {
                    const query = new FindGroupSourceQuery(dto);
                    return await this.queryBus.execute<FindGroupSourceQuery>(
                      query
                    );
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
        )
      )
    );

    return executeTask(task);
  }
}
