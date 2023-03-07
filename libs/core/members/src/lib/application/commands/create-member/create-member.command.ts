import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { MemberRepository } from '../../../adapter/ports/member.repository';
import { CreateMemberDto } from './create-member.dto';
import { CreateMemberMapper } from './create-member.mapper';
import { Member } from '../../../domain/entities/member';
import { MemberRepositoryErrorFactory } from '../../../adapter/ports/member.repository.error-factory';

export class CreateMemberCommand implements ICommand {
  constructor(public readonly createMemberDto: CreateMemberDto) {}
}

/**
 * Command handler for create member
 * TODO
 * - [ ] better associated member check
 *       e.g. check against local IDs rather than just existence of memberId
 */
@CommandHandler(CreateMemberCommand)
export class CreateMemberHandler
  implements ICommandHandler<CreateMemberCommand>
{
  constructor(
    private readonly memberRepository: MemberRepository,
    private logger: LoggableLogger,
    private memberErrorFactory: MemberRepositoryErrorFactory
  ) {
    this.logger.setContext(CreateMemberHandler.name);
  }

  async execute(command: CreateMemberCommand): Promise<Member> {
    const { createMemberDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      createMemberDto,
      parseData(
        CreateMemberDto.check,
        this.logger,
        'InternalRequestInvalidError'
      )
    );

    const { memberSource } = validDto;

    const task = pipe(
      memberSource,

      // #2. transform from dto to entity
      parseActionData(
        CreateMemberMapper.fromSourceToMember,
        this.logger,
        'SourceInvalidError'
      ),

      // #2. update the entity, from the source
      TE.chain((member) =>
        performAction(
          member,
          this.memberRepository.save,
          this.memberErrorFactory,
          this.logger,
          `save member from source`
        )
      )
    );

    return executeTask(task);
  }
}
