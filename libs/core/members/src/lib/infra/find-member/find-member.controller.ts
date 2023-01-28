import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { FindMemberRequestDto } from './dto/find-member.request.dto';
import { FindMemberMapper } from '../../application/queries/find-member/find-member.mapper';
import { FindMemberQuery } from '../../application/queries/find-member/find-member.query';
import { MemberResponseDto } from '../dto/member.response.dto';
import { MemberMapper } from '../member.mapper';

/**
 * Controller for find member operations
 */

@Controller()
export class FindMemberController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(FindMemberController.name);
  }

  public async find(
    requestDto: FindMemberRequestDto
  ): Promise<MemberResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindMemberRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain(
        parseActionData(
          FindMemberMapper.fromFindOrCreateRequestDto,
          this.logger
        )
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindMemberQuery(queryDto);
            return await this.queryBus.execute<FindMemberQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform to the response DTO
      TE.chain(parseActionData(MemberMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
