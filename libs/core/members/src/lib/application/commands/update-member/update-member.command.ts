import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { MemberRepository } from '../../../adapter/ports/member.repository';
import { UpdateMemberDto } from './update-member.dto';
import { UpdateMemberMapper } from './update-member.mapper';
import { Member } from '../../../domain/entities/member';
import { MemberRepositoryErrorFactory } from '../../../adapter/ports/member.repository.error-factory';

export class UpdateMemberCommand implements ICommand {
  constructor(public readonly updateMemberDto: UpdateMemberDto) {}
}

/**
 * Command handler for update member
 */
@CommandHandler(UpdateMemberCommand)
export class UpdateMemberHandler
  implements ICommandHandler<UpdateMemberCommand>
{
  constructor(
    private readonly memberRepository: MemberRepository,
    private logger: LoggableLogger,
    private memberErrorFactory: MemberRepositoryErrorFactory
  ) {
    this.logger.setContext(UpdateMemberHandler.name);
  }

  async execute(command: UpdateMemberCommand): Promise<Member> {
    const { updateMemberDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      updateMemberDto,
      parseData(UpdateMemberDto.check, this.logger, 'SourceInvalidError')
    );

    const { member, memberSource } = validDto;

    const task = pipe(
      // #2. prepare entity for update
      parseData(
        UpdateMemberMapper.fromSourceToMember(member),
        this.logger,
        'SourceInvalidError'
      )(memberSource),

      // #3. make sure an update is required
      parseData(
        UpdateMemberMapper.requiresUpdate<Member>(member),
        this.logger,
        'SourceInvalidError'
      ),

      // #4. update the entity, from the source; if required
      O.fromNullable,
      O.fold(
        // if null, return the original member
        () => {
          this.logger.log(
            `Member ${member.id} does not need to be updated from source`
          );
          return TE.right(member);
        },
        // otherwise, update and return
        (um) =>
          performAction(
            um,
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
