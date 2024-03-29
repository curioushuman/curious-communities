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
  parseUpsertGroupMemberSourceRequestDto,
  UpsertGroupMemberSourceRequestDto,
  UpsertGroupMemberSourceRequestDtoInput,
} from './dto/upsert-group-member-source.request.dto';
import { CreateGroupMemberSourceMapper } from '../../application/commands/create-group-member-source/create-group-member-source.mapper';
import { CreateGroupMemberSourceCommand } from '../../application/commands/create-group-member-source/create-group-member-source.command';
import { UpdateGroupMemberSourceMapper } from '../../application/commands/update-group-member-source/update-group-member-source.mapper';
import { UpdateGroupMemberSourceCommand } from '../../application/commands/update-group-member-source/update-group-member-source.command';
import { FindGroupMemberSourceMapper } from '../../application/queries/find-group-member-source/find-group-member-source.mapper';
import { FindGroupMemberSourceQuery } from '../../application/queries/find-group-member-source/find-group-member-source.query';
import { GroupMemberSource } from '../../domain/entities/group-member-source';
import {
  RepositoryItemNotFoundError,
  RepositoryItemUpdateError,
} from '@curioushuman/error-factory';
import { GroupMemberSourceMapper } from '../group-member-source.mapper';
import { GroupSource } from '../../domain/entities/group-source';
import { FindGroupSourceMapper } from '../../application/queries/find-group-source/find-group-source.mapper';
import { FindGroupSourceQuery } from '../../application/queries/find-group-source/find-group-source.query';
import { GroupSourceStatusEnum } from '../../domain/value-objects/group-source-status';
import { GroupMemberStatusEnum } from '../../domain/value-objects/group-member-status';
import { DeleteGroupMemberSourceCommand } from '../../application/commands/delete-group-member-source/delete-group-member-source.command';
import {
  prepareDeleteResponsePayload,
  prepareUpsertResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';
import { FindGroupMemberMapper } from '../../application/queries/find-group-member/find-group-member.mapper';
import { GroupMember } from '../../domain/entities/group-member';
import { FindGroupMemberQuery } from '../../application/queries/find-group-member/find-group-member.query';
import { GroupMemberMapper } from '../group-member.mapper';

/**
 * Controller for upsert groupMemberSource operations
 *
 * TODO:
 * - [ ] support base or full dto
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
   * TODO:
   * - [ ] at some point stop accepting base version of group member
   */
  public async upsert(
    requestDto: UpsertGroupMemberSourceRequestDtoInput
  ): Promise<ResponsePayload<'group-member-source'>> {
    // #1. validate the dto
    this.logger.debug(requestDto, 'upsert');
    const validDto = await this.parseDtoInput(requestDto);

    // extract some values
    const { groupMember } = validDto;
    const { group } = groupMember;

    // #2. find groupMemberSource and groupSource
    // NOTE: These will error if they need to
    // specifically findGroup; inc. if no group
    const [groupSource, groupMemberSource] = await Promise.all([
      this.findGroupSource(validDto),
      this.findGroupMemberSource(validDto),
    ]);

    // #3. work out if a groupMemberSource should in fact not exist
    if (
      group.status !== GroupSourceStatusEnum.ACTIVE &&
      groupMember.status !== GroupMemberStatusEnum.ACTIVE
    ) {
      const groupMemberSourceDeleted = await executeTask(
        this.deleteGroupMemberSource(groupMemberSource)
      );
      return pipe(
        groupMemberSourceDeleted,
        prepareDeleteResponsePayload(
          'group-member-source',
          !groupMemberSourceDeleted
        )
      );
    }

    // #4. upsert group member source
    const upsertTask = groupMemberSource
      ? this.updateGroupMemberSource(validDto, groupMemberSource)
      : this.createGroupMemberSource(validDto, groupSource);
    const upsertedGroupMemberSource = await executeTask(upsertTask);
    // we know that at this point, groupMemberSource would exist
    const payload =
      upsertedGroupMemberSource || (groupMemberSource as GroupMemberSource);

    // #5. return the response
    return pipe(
      payload,
      parseData(GroupMemberSourceMapper.toResponseDto, this.logger),
      prepareUpsertResponsePayload(
        'group-member-source',
        !!groupMemberSource,
        groupMemberSource && !upsertedGroupMemberSource
      )
    );
  }

  private async parseDtoInput(
    dto: UpsertGroupMemberSourceRequestDtoInput
  ): Promise<UpsertGroupMemberSourceRequestDto> {
    // check that we haven't been passed the correct DTO already
    if ('group' in dto) {
      return parseUpsertGroupMemberSourceRequestDto(
        dto as UpsertGroupMemberSourceRequestDto
      );
    }

    // otherwise find the groupMember manually and prepare the correct DTO
    const groupMember = await this.findGroupMember(dto);
    return {
      ...dto,
      groupMember: GroupMemberMapper.toResponseDto(groupMember),
    };
  }

  private deleteGroupMemberSource(
    groupMemberSource: GroupMemberSource | undefined
  ): TE.TaskEither<Error, undefined> {
    if (!groupMemberSource) {
      return TE.right(undefined);
    }
    const deleteDto = {
      groupMemberSource,
    };
    return TE.tryCatch(
      async () => {
        const command = new DeleteGroupMemberSourceCommand(deleteDto);
        return await this.commandBus.execute<DeleteGroupMemberSourceCommand>(
          command
        );
      },
      (error: unknown) => error as Error
    );
  }

  private createGroupMemberSource(
    validDto: UpsertGroupMemberSourceRequestDto,
    groupSource: GroupSource
  ): TE.TaskEither<Error, GroupMemberSource> {
    return pipe(
      validDto,
      parseActionData(
        CreateGroupMemberSourceMapper.fromUpsertRequestDto(groupSource),
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
    );
  }

  private updateGroupMemberSource(
    validDto: UpsertGroupMemberSourceRequestDto,
    groupMemberSource: GroupMemberSource
  ): TE.TaskEither<Error, GroupMemberSource | undefined> {
    return pipe(
      validDto,
      parseActionData(
        UpdateGroupMemberSourceMapper.fromUpsertRequestDto(groupMemberSource),
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

  private findGroupMember(
    requestDto: UpsertGroupMemberSourceRequestDtoInput
  ): Promise<GroupMember> {
    const task = pipe(
      requestDto,

      // #1. transform the dto
      // NOTE: it is within this mapper function that we look for idSource, if not email
      parseActionData(
        FindGroupMemberMapper.fromUpsertGroupMemberSourceRequestDtoInput,
        this.logger
      ),

      // #2. find the groupMemberSource
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindGroupMemberQuery(findDto);
              return await this.queryBus.execute<FindGroupMemberQuery>(query);
            },
            (error: unknown) => error as Error
          )
        )
      )
    );

    return executeTask(task);
  }

  private findGroupMemberSource(
    requestDto: UpsertGroupMemberSourceRequestDto
  ): Promise<GroupMemberSource | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform the dto
      // NOTE: it is within this mapper function that we look for idSource, if not email
      parseActionData(
        FindGroupMemberSourceMapper.fromUpsertRequestDto,
        this.logger
      ),

      // #2. find the groupMemberSource
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindGroupMemberSourceQuery(findDto);
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
    );

    return executeTask(task);
  }

  private findGroupSource(
    requestDto: UpsertGroupMemberSourceRequestDto
  ): Promise<GroupSource> {
    const task = pipe(
      requestDto,

      // #1. transform the dto
      // NOTE: it is within this mapper function that we look for idSource, if not email
      parseActionData(
        FindGroupSourceMapper.fromUpsertGroupMemberSourceRequestDto,
        this.logger
      ),

      // #2. find the groupMemberSource
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindGroupSourceQuery(findDto);
              return await this.queryBus.execute<FindGroupSourceQuery>(query);
            },
            (error: unknown) => error as Error
          )
        )
      )
    );

    return executeTask(task);
  }
}
