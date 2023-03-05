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

import { UpdateGroupRequestDto } from './dto/update-group.request.dto';
import { FindGroupMapper } from '../../application/queries/find-group/find-group.mapper';
import { FindGroupQuery } from '../../application/queries/find-group/find-group.query';
import { UpdateGroupCommand } from '../../application/commands/update-group/update-group.command';
import { UpdateGroupMapper } from '../../application/commands/update-group/update-group.mapper';
import { CourseGroupMapper } from '../course-group.mapper';
import { isCourseGroupBase } from '../../domain/entities/group';
import { GroupBase } from '../../domain/entities/group';
import { StandardGroupMapper } from '../standard-group.mapper';
import {
  prepareUpsertResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';

/**
 * Controller for update group operations
 *
 * TODO:
 * - [ ] whole thing could be done in fp-ts
 */
@Controller()
export class UpdateGroupController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpdateGroupController.name);
  }

  /**
   * Public method to update a group
   *
   * TODO:
   * - [ ] whole thing could be done in fp-ts
   * ? [ ] should more of this logic be in a service?
   */
  public async update(
    requestDto: UpdateGroupRequestDto
  ): Promise<ResponsePayload<'group-base'>> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(UpdateGroupRequestDto.check, this.logger)
    );

    // #2. find group & group
    // NOTE: These will error if they need to
    // specifically findGroup; inc. if no group
    // ? this kind of logic is questionable in a controller!!!
    // NOTE: if request was internal, we can skip these checks
    if (validDto.requestSource !== RequestSourceEnum.INTERNAL) {
      // we are not going to use the group OR group here, but we need to check if it exists
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const group = await this.findGroup(validDto);
    }

    // #3. update group
    const updatedGroup = await executeTask(this.updateGroup(validDto));

    // #4. return the response
    let payload = validDto.group;
    if (updatedGroup) {
      // if updated, return the updated group
      const mapper = isCourseGroupBase(updatedGroup)
        ? CourseGroupMapper.toBaseResponseDto
        : StandardGroupMapper.toBaseResponseDto;
      payload = pipe(updatedGroup, parseData(mapper, this.logger));
    }

    return pipe(
      payload,
      prepareUpsertResponsePayload('group-base', true, !updatedGroup)
    );
  }

  private updateGroup(
    validDto: UpdateGroupRequestDto
  ): TE.TaskEither<Error, GroupBase | undefined> {
    return pipe(
      validDto,
      parseActionData(UpdateGroupMapper.fromUpdateGroupRequestDto, this.logger),
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

  private findGroup(requestDto: UpdateGroupRequestDto): Promise<GroupBase> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindGroupMapper.fromUpdateGroupRequestDto,
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
}
