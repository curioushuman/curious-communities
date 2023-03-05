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
  parseUpdateGroupMemberRequestDto,
  UpdateGroupMemberRequestDto,
} from './dto/update-group-member.request.dto';
import { FindGroupMapper } from '../../application/queries/find-group/find-group.mapper';
import { FindGroupQuery } from '../../application/queries/find-group/find-group.query';
import { FindGroupMemberQuery } from '../../application/queries/find-group-member/find-group-member.query';
import { UpdateGroupMemberCommand } from '../../application/commands/update-group-member/update-group-member.command';
import { FindGroupMemberMapper } from '../../application/queries/find-group-member/find-group-member.mapper';
import { UpdateGroupMemberMapper } from '../../application/commands/update-group-member/update-group-member.mapper';
import { CourseGroupMemberMapper } from '../course-group-member.mapper';
import {
  GroupMember,
  isCourseGroupMember,
} from '../../domain/entities/group-member';
import { GroupBase } from '../../domain/entities/group';
import { StandardGroupMemberMapper } from '../standard-group-member.mapper';
import {
  prepareUpsertResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';

/**
 * Controller for update group member operations
 *
 * TODO:
 * - [ ] whole thing could be done in fp-ts
 */
@Controller()
export class UpdateGroupMemberController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpdateGroupMemberController.name);
  }

  /**
   * Public method to update a group
   *
   * TODO:
   * - [ ] whole thing could be done in fp-ts
   * ? [ ] should more of this logic be in a service?
   */
  public async update(
    requestDto: UpdateGroupMemberRequestDto
  ): Promise<ResponsePayload<'group-member'>> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(parseUpdateGroupMemberRequestDto, this.logger)
    );

    // #2. find group & groupMember
    // NOTE: These will error if they need to
    // specifically findGroup; inc. if no group
    // ? this kind of logic is questionable in a controller!!!
    // NOTE: if request was internal, we can skip these checks
    if (validDto.requestSource !== RequestSourceEnum.INTERNAL) {
      // we are not going to use the group OR groupMember here, but we need to check if it exists
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [group, groupMember] = await Promise.all([
        this.findGroup(validDto),
        this.findGroupMember(validDto),
      ]);
    }

    // #3. update group member
    // we're type casting here as we would have thrown an error if the groupMember was undefined
    const updatedGroupMember = await executeTask(
      this.updateGroupMember(validDto)
    );

    // #4. return the response
    let payload = validDto.groupMember;
    if (updatedGroupMember) {
      // if updated, return the updated group member
      const mapper = isCourseGroupMember(updatedGroupMember)
        ? CourseGroupMemberMapper.toResponseDto
        : StandardGroupMemberMapper.toResponseDto;
      payload = pipe(updatedGroupMember, parseData(mapper, this.logger));
    }

    return pipe(
      payload,
      prepareUpsertResponsePayload('group-member', true, !updatedGroupMember)
    );
  }

  private updateGroupMember(
    validDto: UpdateGroupMemberRequestDto
  ): TE.TaskEither<Error, GroupMember | undefined> {
    return pipe(
      validDto,
      parseActionData(
        UpdateGroupMemberMapper.fromUpdateGroupMemberRequestDto,
        this.logger
      ),
      TE.chain((updateDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateGroupMemberCommand(updateDto);
            return await this.commandBus.execute<UpdateGroupMemberCommand>(
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

  private findGroup(
    requestDto: UpdateGroupMemberRequestDto
  ): Promise<GroupBase> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindGroupMapper.fromUpdateGroupMemberRequestDto,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. call the query
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindGroupQuery(findDto);
              return await this.queryBus.execute<FindGroupQuery>(query);
            },
            (error: unknown) => error as Error
          )
        )
      )
    );

    return executeTask(task);
  }

  private findGroupMember(
    requestDto: UpdateGroupMemberRequestDto
  ): Promise<GroupMember | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindGroupMemberMapper.fromUpdateGroupMemberRequestDto,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. call the query
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
}
