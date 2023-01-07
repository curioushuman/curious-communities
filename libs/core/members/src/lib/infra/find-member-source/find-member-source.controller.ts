import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { FindMemberSourceRequestDto } from './dto/find-member-source.request.dto';
import { FindMemberSourceMapper } from '../../application/queries/find-member-source/find-member-source.mapper';
import { FindMemberSourceQuery } from '../../application/queries/find-member-source/find-member-source.query';
import { MemberSourceResponseDto } from '../dto/member-source.response.dto';
import { MemberSourceMapper } from '../member-source.mapper';

/**
 * Controller for find member operations
 */

@Controller()
export class FindMemberSourceController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(FindMemberSourceController.name);
  }

  public async find(
    requestDto: FindMemberSourceRequestDto
  ): Promise<MemberSourceResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindMemberSourceRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(FindMemberSourceMapper.fromFindRequestDto, this.logger)
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindMemberSourceQuery(queryDto);
            return await this.queryBus.execute<FindMemberSourceQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(MemberSourceMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
