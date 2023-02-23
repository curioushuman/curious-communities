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

import { UpdateMemberRequestDto } from './dto/update-member.request.dto';
import { UpdateMemberCommand } from '../../application/commands/update-member/update-member.command';
import { MemberMapper } from '../member.mapper';
import { MemberSource } from '../../domain/entities/member-source';
import { FindMemberMapper } from '../../application/queries/find-member/find-member.mapper';
import { FindMemberQuery } from '../../application/queries/find-member/find-member.query';
import { Member } from '../../domain/entities/member';
import { UpdateMemberDto } from '../../application/commands/update-member/update-member.dto';
import { FindMemberSourceMapper } from '../../application/queries/find-member-source/find-member-source.mapper';
import { FindMemberSourceQuery } from '../../application/queries/find-member-source/find-member-source.query';
import {
  prepareUpsertResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';

/**
 * Controller for update member operations
 *
 * NOTES
 * - we initially returned void for create/update actions
 *   see create controller for more info
 */

@Controller()
export class UpdateMemberController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(UpdateMemberController.name);
  }

  /**
   * Public method to update a member
   *
   * TODO:
   * - [ ] whole thing could be done in fp-ts
   */
  public async update(
    requestDto: UpdateMemberRequestDto
  ): Promise<ResponsePayload<'member'>> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(UpdateMemberRequestDto.check, this.logger)
    );

    // #2. find source and member
    // NOTE: These will error if they need to
    // including NotFound for either
    const [member, memberSource] = await Promise.all([
      this.findMember(validDto),
      this.findMemberSource(validDto),
    ]);

    // ? should the comparison of source to member be done here?

    // set up the command dto
    const updateDto = {
      member,
      memberSource,
    } as UpdateMemberDto;

    // #3. execute the command
    const updatedMember = await this.updateMember(updateDto);

    // #4. return the response
    let payload = pipe(
      member,
      parseData(MemberMapper.toResponseDto, this.logger)
    );
    if (updatedMember) {
      payload = pipe(
        updatedMember,
        parseData(MemberMapper.toResponseDto, this.logger)
      );
    }

    return pipe(
      payload,
      prepareUpsertResponsePayload('member', true, !updatedMember)
    );
  }

  private updateMember(updateDto: UpdateMemberDto): Promise<Member> {
    const task = pipe(
      updateDto,

      // #1. validate the command dto
      // NOTE: this will also occur in the command itself
      // but the Runtype.check function is such a useful way to
      // also make sure the types are correct. Better than typecasting
      parseActionData(UpdateMemberDto.check, this.logger),

      // #2. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new UpdateMemberCommand(commandDto);
            return await this.commandBus.execute<UpdateMemberCommand>(command);
          },
          (error: unknown) => error as Error
        )
      ),

      // #3. catch the update error specifically
      TE.orElse((err) => {
        return err instanceof RepositoryItemUpdateError
          ? TE.right(undefined)
          : TE.left(err);
      })
    );

    return executeTask(task);
  }

  private findMember(
    requestDto: UpdateMemberRequestDto
  ): Promise<Member | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(FindMemberMapper.fromUpdateMemberRequestDto, this.logger),

      // #2. call the query
      TE.chain((findDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindMemberQuery(findDto);
            return await this.queryBus.execute<FindMemberQuery>(query);
          },
          (error: unknown) => error as Error
        )
      )
    );

    return executeTask(task);
  }

  private findMemberSource(
    requestDto: UpdateMemberRequestDto
  ): Promise<MemberSource | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindMemberSourceMapper.fromUpdateMemberRequestDto,
        this.logger
      ),

      // #2. call the query
      TE.chain((findDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindMemberSourceQuery(findDto);
            return await this.queryBus.execute<FindMemberSourceQuery>(query);
          },
          (error: unknown) => error as Error
        )
      )
    );

    return executeTask(task);
  }
}
