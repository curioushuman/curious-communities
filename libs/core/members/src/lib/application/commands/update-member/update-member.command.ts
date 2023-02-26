import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryItemUpdateError } from '@curioushuman/error-factory';

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

    const { member } = validDto;

    // #2 validate/parse the groupMember from the DTO
    const parsedMember = this.parseDto(validDto);

    const task = pipe(
      parsedMember,

      // #3. update the entity, from the source; if required
      O.fromNullable,
      O.fold(
        // if null, throw an error
        () => {
          const msg = `Member ${member.id} does not need to be updated`;
          // as we catch this error above, it is no longer logged
          // so let's log it manually for a complete audit trail
          this.logger.error(msg);
          throw new RepositoryItemUpdateError(msg);
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

  parseDto(validDto: UpdateMemberDto): Member | undefined {
    const { member, memberSource } = validDto;
    // if no memberSource it means we're doing a straight update
    // so we skip the requiresUpdate check
    if (!memberSource) {
      return member;
    }
    return pipe(
      memberSource,
      // #4. update the entity, from the course/source
      parseData(
        UpdateMemberMapper.fromSourceToMember(member),
        this.logger,
        'InternalRequestInvalidError'
      ),
      // #3. make sure an update is required
      parseData(
        UpdateMemberMapper.requiresUpdate<Member>(member),
        this.logger,
        'InternalRequestInvalidError'
      )
    );
  }
}
