import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { FindGroupRequestDto } from './dto/find-group.request.dto';
import { FindGroupMapper } from '../../application/queries/find-group/find-group.mapper';
import { FindGroupQuery } from '../../application/queries/find-group/find-group.query';
import { GroupResponseDto } from '../dto/group.response.dto';
import { GroupMapper } from '../group.mapper';

/**
 * Controller for find group operations
 */

@Controller()
export class FindGroupController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(FindGroupController.name);
  }

  public async find(
    requestDto: FindGroupRequestDto
  ): Promise<GroupResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindGroupRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(FindGroupMapper.fromFindRequestDto, this.logger)
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindGroupQuery(queryDto);
            return await this.queryBus.execute<FindGroupQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(GroupMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
