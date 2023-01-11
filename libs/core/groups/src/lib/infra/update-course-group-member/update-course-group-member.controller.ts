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

import { MutateCourseGroupMemberRequestDto } from '../../infra/dto/mutate-course-group-member.request.dto';
import { UpdateCourseGroupMemberMapper } from '../../application/commands/update-course-group-member/update-course-group-member.mapper';
import { UpdateCourseGroupMemberCommand } from '../../application/commands/update-course-group-member/update-course-group-member.command';
import { GroupMemberResponseDto } from '../dto/group-member.response.dto';
import { GroupMemberMapper } from '../group-member.mapper';
import { FindCourseGroupMapper } from '../../application/queries/find-course-group/find-course-group.mapper';
import { FindCourseGroupQuery } from '../../application/queries/find-course-group/find-course-group.query';
import { CourseGroup } from '../../domain/entities/course-group';

/**
 * Controller for update course-group-member operations
 *
 * TODO
 * - [ ] switch to upsert
 */

@Controller()
export class UpdateCourseGroupMemberController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpdateCourseGroupMemberController.name);
  }

  public async update(
    requestDto: MutateCourseGroupMemberRequestDto
  ): Promise<GroupMemberResponseDto> {
    // #1. parse the dto
    const validDto = pipe(
      requestDto,
      parseData(MutateCourseGroupMemberRequestDto.check, this.logger)
    );

    // #2. find a group
    const group = await this.findGroup(validDto);

    const task = pipe(
      validDto,

      // #2. transform the dto
      parseActionData(
        UpdateCourseGroupMemberMapper.fromRequestDto(group),
        this.logger
      ),

      // #3. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateCourseGroupMemberCommand(commandDto);
            return await this.commandBus.execute<UpdateCourseGroupMemberCommand>(
              command
            );
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(GroupMemberMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }

  private findGroup(
    validRequestDto: MutateCourseGroupMemberRequestDto
  ): Promise<CourseGroup> {
    const task = pipe(
      validRequestDto,

      // #1. transform the dto
      parseActionData(
        FindCourseGroupMapper.fromMutateCourseGroupMemberRequestDto,
        this.logger
      ),

      // #2. find the group
      // NOTE: this will throw an error if not found
      // and we're OK with this, as we can't move forward without group
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindCourseGroupQuery(findDto);
              return await this.queryBus.execute<FindCourseGroupQuery>(query);
            },
            (error: unknown) => error as Error
          )
        )
      )
    );

    return executeTask(task);
  }
}
