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

import { UpsertCourseGroupMemberRequestDto } from './dto/upsert-course-group-member.request.dto';
import { FindGroupMapper } from '../../application/queries/find-group/find-group.mapper';
import { FindGroupQuery } from '../../application/queries/find-group/find-group.query';
import { FindGroupMemberQuery } from '../../application/queries/find-group-member/find-group-member.query';
import { UpdateGroupMemberCommand } from '../../application/commands/update-group-member/update-group-member.command';
import { FindGroupMemberMapper } from '../../application/queries/find-group-member/find-group-member.mapper';
import { CreateGroupMemberMapper } from '../../application/commands/create-group-member/create-group-member.mapper';
import { UpdateGroupMemberMapper } from '../../application/commands/update-group-member/update-group-member.mapper';
import { CreateGroupMemberCommand } from '../../application/commands/create-group-member/create-group-member.command';
import { CourseGroupMemberMapper } from '../course-group-member.mapper';
import { CourseGroupBase } from '../../domain/entities/course-group';
import { CourseGroupMember } from '../../domain/entities/course-group-member';
import {
  prepareUpsertResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';

/**
 * Controller for create group operations
 */
@Controller()
export class UpsertCourseGroupMemberController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpsertCourseGroupMemberController.name);
  }

  /**
   * Public method to upsert a group
   *
   * TODO:
   * - [ ] whole thing could be done in fp-ts
   * ? [ ] should more of this logic be in a service?
   */
  public async upsert(
    requestDto: UpsertCourseGroupMemberRequestDto
  ): Promise<ResponsePayload<'course-group-member-base'>> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(UpsertCourseGroupMemberRequestDto.check, this.logger)
    );

    // #2. find group and groupMember
    // NOTE: These will error if they need to
    // specifically findGroup; inc. if no group
    const group = await this.findGroup(validDto);
    const groupMember = await this.findGroupMember(validDto, group);

    // #3. upsert group member
    const upsertTask = groupMember
      ? this.updateGroupMember(validDto, groupMember)
      : this.createGroupMember(validDto, group);
    const upsertedGroupMember = await executeTask(upsertTask);
    // we know that at this point, groupMember would exist
    const payload = upsertedGroupMember || (groupMember as CourseGroupMember);

    // #4. return the response
    return pipe(
      payload,
      parseData(CourseGroupMemberMapper.toBaseResponseDto, this.logger),
      prepareUpsertResponsePayload(
        'course-group-member-base',
        !!groupMember,
        groupMember && !upsertedGroupMember
      )
    );
  }

  private createGroupMember(
    validDto: UpsertCourseGroupMemberRequestDto,
    group: CourseGroupBase
  ): TE.TaskEither<Error, CourseGroupMember> {
    return pipe(
      validDto,
      parseActionData(
        CreateGroupMemberMapper.fromUpsertCourseGroupMemberRequestDto(group),
        this.logger
      ),
      TE.chain((createDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateGroupMemberCommand(createDto);
            return await this.commandBus.execute<CreateGroupMemberCommand>(
              command
            );
          },
          (error: unknown) => error as Error
        )
      )
    );
  }

  private updateGroupMember(
    validDto: UpsertCourseGroupMemberRequestDto,
    groupMember: CourseGroupMember
  ): TE.TaskEither<Error, CourseGroupMember | undefined> {
    return pipe(
      validDto,
      parseActionData(
        UpdateGroupMemberMapper.fromUpsertCourseGroupMemberRequestDto(
          groupMember
        ),
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
    requestDto: UpsertCourseGroupMemberRequestDto
  ): Promise<CourseGroupBase> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindGroupMapper.fromUpsertCourseGroupMemberRequestDto,
        this.logger,
        'SourceInvalidError'
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
    requestDto: UpsertCourseGroupMemberRequestDto,
    group: CourseGroupBase
  ): Promise<CourseGroupMember | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindGroupMemberMapper.fromUpsertCourseGroupMemberRequestDto(group),
        this.logger,
        'SourceInvalidError'
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
