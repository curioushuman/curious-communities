import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';

import {
  checkUpsertGroupMemberSourceRequestDto,
  UpsertGroupMemberSourceRequestDto,
} from './dto/upsert-group-member-source.request.dto';
import { CreateGroupMemberSourceMapper } from '../../application/commands/create-group-member-source/create-group-member-source.mapper';
import { CreateGroupMemberSourceCommand } from '../../application/commands/create-group-member-source/create-group-member-source.command';
import { UpdateGroupMemberSourceMapper } from '../../application/commands/update-group-member-source/update-group-member-source.mapper';
import { UpdateGroupMemberSourceCommand } from '../../application/commands/update-group-member-source/update-group-member-source.command';
import { GroupMemberSourceResponseDto } from '../dto/group-member-source.response.dto';
import { GroupMemberSourceMapper } from '../group-member-source.mapper';
import { FindGroupMemberSourceMapper } from '../../application/queries/find-group-member-source/find-group-member-source.mapper';
import { FindGroupMemberSourceQuery } from '../../application/queries/find-group-member-source/find-group-member-source.query';
import { GroupMemberSource } from '../../domain/entities/group-member-source';

/**
 * Controller for upsert group operations
 */

@Controller()
export class UpsertGroupMemberSourceController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpsertGroupMemberSourceController.name);
  }

  /**
   * This will look for a groupMemberSource at the relevant source
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
    requestDto: UpsertGroupMemberSourceRequestDto
  ): Promise<GroupMemberSourceResponseDto> {
    // #1. parse the dto
    const validDto = pipe(
      requestDto,
      parseData(checkUpsertGroupMemberSourceRequestDto, this.logger)
    );

    // #2. find a group
    const groupMemberSource = await this.find(validDto);

    // #3. based on whether or not we find anything, take the appropriate action
    // groupMemberSource could be null
    const task = pipe(
      groupMemberSource,
      O.fromNullable,
      O.fold(
        // if it is, then create
        () =>
          pipe(
            requestDto,
            parseActionData(
              CreateGroupMemberSourceMapper.fromUpsertRequestDto,
              this.logger
            ),
            TE.chain((createDto) =>
              TE.tryCatch(
                async () => {
                  const command = new CreateGroupMemberSourceCommand(createDto);
                  return await this.commandBus.execute<CreateGroupMemberSourceCommand>(
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
              UpdateGroupMemberSourceMapper.fromUpsertRequestDto(ms),
              this.logger
            ),
            TE.chain((updateDto) =>
              TE.tryCatch(
                async () => {
                  const command = new UpdateGroupMemberSourceCommand(updateDto);
                  return await this.commandBus.execute<UpdateGroupMemberSourceCommand>(
                    command
                  );
                },
                (error: unknown) => error as Error
              )
            )
          )
      ),

      // #5. transform to the response DTO
      TE.chain(
        parseActionData(GroupMemberSourceMapper.toResponseDto, this.logger)
      )
    );

    return executeTask(task);
  }

  private find(
    requestDto: UpsertGroupMemberSourceRequestDto
  ): Promise<GroupMemberSource | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindGroupMemberSourceMapper.fromUpsertRequestDto,
        this.logger
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
                    const query = new FindGroupMemberSourceQuery(dto);
                    return await this.queryBus.execute<FindGroupMemberSourceQuery>(
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
