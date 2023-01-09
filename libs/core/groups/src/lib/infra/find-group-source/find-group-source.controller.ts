import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { FindGroupSourceRequestDto } from './dto/find-group-source.request.dto';
import { FindGroupSourceMapper } from '../../application/queries/find-group-source/find-group-source.mapper';
import { FindGroupSourceQuery } from '../../application/queries/find-group-source/find-group-source.query';
import { GroupSourceResponseDto } from '../dto/group-source.response.dto';
import { GroupSourceMapper } from '../group-source.mapper';

/**
 * Controller for find group operations
 */

@Controller()
export class FindGroupSourceController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(FindGroupSourceController.name);
  }

  public async find(
    requestDto: FindGroupSourceRequestDto
  ): Promise<GroupSourceResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindGroupSourceRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(FindGroupSourceMapper.fromFindRequestDto, this.logger)
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindGroupSourceQuery(queryDto);
            return await this.queryBus.execute<FindGroupSourceQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(GroupSourceMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
