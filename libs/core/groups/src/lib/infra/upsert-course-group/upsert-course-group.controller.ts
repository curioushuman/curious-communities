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

import { UpsertCourseGroupRequestDto } from './dto/upsert-course-group.request.dto';
import { CreateGroupCommand } from '../../application/commands/create-group/create-group.command';
import { CourseGroupBaseResponseDto } from '../dto/course-group.response.dto';
import { CourseGroupMapper } from '../course-group.mapper';
import { FindGroupMapper } from '../../application/queries/find-group/find-group.mapper';
import { FindGroupQuery } from '../../application/queries/find-group/find-group.query';
import { CreateGroupMapper } from '../../application/commands/create-group/create-group.mapper';
import { UpdateGroupCommand } from '../../application/commands/update-group/update-group.command';
import { UpdateGroupMapper } from '../../application/commands/update-group/update-group.mapper';
import { CourseGroupBase } from '../../domain/entities/course-group';

/**
 * Controller for create group operations
 */
@Controller()
export class UpsertCourseGroupController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpsertCourseGroupController.name);
  }

  /**
   * Public method to upsert a group
   *
   * TODO:
   * - [ ] whole thing could be done in fp-ts
   * ? [ ] should more of this logic be in a service?
   */
  public async upsert(
    requestDto: UpsertCourseGroupRequestDto
  ): Promise<CourseGroupBaseResponseDto | undefined> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(UpsertCourseGroupRequestDto.check, this.logger)
    );

    // #2. find group
    // NOTE: These will error if they need to
    const group = await this.findGroup(validDto);

    // #3. upsert group
    const upsertTask = group
      ? this.updateGroup(validDto, group)
      : this.createGroup(validDto);
    const upsertedGroup = await executeTask(upsertTask);

    // #4. return the response
    return upsertedGroup !== undefined
      ? pipe(
          upsertedGroup,
          parseData(CourseGroupMapper.toBaseResponseDto, this.logger)
        )
      : undefined;
  }

  private createGroup(
    validDto: UpsertCourseGroupRequestDto
  ): TE.TaskEither<Error, CourseGroupBase> {
    return pipe(
      validDto,
      parseActionData(
        CreateGroupMapper.fromUpsertCourseGroupRequestDto,
        this.logger
      ),
      TE.chain((createDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateGroupCommand(createDto);
            return await this.commandBus.execute<CreateGroupCommand>(command);
          },
          (error: unknown) => error as Error
        )
      )
    );
  }

  private updateGroup(
    validDto: UpsertCourseGroupRequestDto,
    group: CourseGroupBase
  ): TE.TaskEither<Error, CourseGroupBase | undefined> {
    return pipe(
      validDto,
      parseActionData(
        UpdateGroupMapper.fromUpsertCourseGroupRequestDto(group),
        this.logger
      ),
      TE.chain((updateDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateGroupCommand(updateDto);
            return await this.commandBus.execute<UpdateGroupCommand>(command);
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
    requestDto: UpsertCourseGroupRequestDto
  ): Promise<CourseGroupBase | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindGroupMapper.fromUpsertCourseGroupRequestDto,
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
