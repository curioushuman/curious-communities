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
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';

import { CreateMemberRequestDto } from './dto/create-member.request.dto';
import { CreateMemberCommand } from '../../application/commands/create-member/create-member.command';
import { MemberMapper } from '../member.mapper';
import { MemberSource } from '../../domain/entities/member-source';
import { FindMemberMapper } from '../../application/queries/find-member/find-member.mapper';
import { FindMemberQuery } from '../../application/queries/find-member/find-member.query';
import { Member } from '../../domain/entities/member';
import { CreateMemberDto } from '../../application/commands/create-member/create-member.dto';
import { FindMemberSourceMapper } from '../../application/queries/find-member-source/find-member-source.mapper';
import { FindMemberSourceQuery } from '../../application/queries/find-member-source/find-member-source.query';
import {
  prepareResponsePayload,
  ResponsePayload,
} from '../dto/response-payload';

/**
 * Controller for create member operations
 *
 * NOTES
 * - I would prefer to throw a RepositoryItemConflictError and have the lambda catch it
 */
@Controller()
export class CreateMemberController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(CreateMemberController.name);
  }

  /**
   * Public method to create a member
   *
   * ! POSSIBLE DEPRECATION
   *
   * TODO:
   * - [ ] whole thing could be done in fp-ts
   */
  public async create(
    requestDto: CreateMemberRequestDto
  ): Promise<ResponsePayload<'member'>> {
    // #1. validate the dto
    const validDto = pipe(
      requestDto,
      parseData(CreateMemberRequestDto.check, this.logger)
    );

    // #2. find source and member
    // NOTE: These will error if they need to
    const [member, memberSource] = await Promise.all([
      this.findMember(validDto),
      this.findMemberSource(validDto),
    ]);

    // if a member exists, throw an error, go no further
    // UPDATE: log the error, don't throw it
    // we don't want the calling lambda to fail/retry
    // try/catch at the lambda level doesn't seem to work
    if (member) {
      // throw new RepositoryItemConflictError(`Member id: ${member.id}`);
      this.logger.error(
        `Member already exists with id: ${member.id}`,
        'RepositoryItemConflictError'
      );
      return pipe(
        member,
        parseData(MemberMapper.toResponseDto, this.logger),
        prepareResponsePayload('member', 'created', 'failure')
      );
    }

    // #3. create the member
    // otherwise, crack on
    // type-casting is OK as we validate in the createMember function
    const createDto = {
      memberSource: memberSource,
    } as CreateMemberDto;
    const createdMember = await this.createMember(createDto);

    // #4. transform to the response DTO
    return pipe(
      createdMember,
      parseData(MemberMapper.toResponseDto, this.logger),
      prepareResponsePayload('member', 'created', 'success')
    );
  }

  private createMember(createDto: CreateMemberDto): Promise<Member> {
    const task = pipe(
      createDto,

      // #3. validate the command dto
      // NOTE: this will also occur in the command itself
      // but the Runtype.check function is such a useful way to
      // also make sure the types are correct. Better than typecasting
      parseActionData(CreateMemberDto.check, this.logger),

      // #4. call the command
      // NOTE: proper error handling within the command itself
      TE.chain((commandDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateMemberCommand(commandDto);
            return await this.commandBus.execute<CreateMemberCommand>(command);
          },
          (error: unknown) => error as Error
        )
      )
    );

    return executeTask(task);
  }

  private findMember(
    requestDto: CreateMemberRequestDto
  ): Promise<Member | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindMemberMapper.fromFindRequestDto,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. call the query
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindMemberQuery(findDto);
              return await this.queryBus.execute<FindMemberQuery>(query);
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

  private findMemberSource(
    requestDto: CreateMemberRequestDto
  ): Promise<MemberSource | undefined> {
    const task = pipe(
      requestDto,

      // #1. transform dto
      parseActionData(
        FindMemberSourceMapper.fromFindOrCreateRequestDto,
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
