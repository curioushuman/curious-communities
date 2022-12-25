import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import {
  ErrorFactory,
  RepositoryItemNotFoundError,
} from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { MemberRepository } from '../../../adapter/ports/member.repository';
import { UpdateMemberDto } from './update-member.dto';
import { UpdateMemberMapper } from './update-member.mapper';
import { MemberSourceRepository } from '../../../adapter/ports/member-source.repository';
import { MemberSource } from '../../../domain/entities/member-source';
import { MemberMapper } from '../../member.mapper';

export class UpdateMemberCommand implements ICommand {
  constructor(public readonly updateMemberDto: UpdateMemberDto) {}
}

/**
 * Command handler for update member
 * TODO
 * - [ ] better associated member check
 *       e.g. check against local IDs rather than just existence of memberId
 */
@CommandHandler(UpdateMemberCommand)
export class UpdateMemberHandler
  implements ICommandHandler<UpdateMemberCommand>
{
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly memberSourceRepository: MemberSourceRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(UpdateMemberHandler.name);
  }

  async execute(command: UpdateMemberCommand): Promise<void> {
    const { updateMemberDto } = command;

    const task = pipe(
      // #1. parse the dto
      // we want two DTOs 1. to find source, and 2. find member
      sequenceT(TE.ApplySeq)(
        parseActionData(
          UpdateMemberMapper.toFindMemberSourceDto,
          this.logger,
          'RequestInvalidError'
        )(updateMemberDto),
        parseActionData(
          UpdateMemberMapper.toFindMemberDto,
          this.logger,
          'RequestInvalidError'
        )(updateMemberDto)
      ),

      // #2. Find the source, and the member (to be updated)
      TE.chain(([findMemberSourceDto, findMemberDto]) =>
        sequenceT(TE.ApplySeq)(
          performAction(
            findMemberSourceDto,
            this.memberSourceRepository.findOne,
            this.errorFactory,
            this.logger,
            `find member source: ${findMemberSourceDto.id}`
          ),
          performAction(
            findMemberDto.value,
            this.memberRepository.checkByExternalId,
            this.errorFactory,
            this.logger,
            `find member: ${findMemberDto.value}`
          )
        )
      ),

      // #3. validate + transform; members exists, source is valid, source to member
      TE.chain(([memberSource, memberExists]) => {
        if (!memberSource) {
          throw new RepositoryItemNotFoundError(
            `Member source id: ${updateMemberDto.externalId}`
          );
        }
        if (memberExists === false) {
          throw new RepositoryItemNotFoundError(
            `Member id: ${updateMemberDto.externalId}`
          );
        }
        return pipe(
          memberSource,
          parseActionData(
            MemberSource.check,
            this.logger,
            'SourceInvalidError'
          ),
          TE.chain((memberSourceChecked) =>
            parseActionData(
              MemberMapper.fromSourceToMember,
              this.logger,
              'SourceInvalidError'
            )(memberSourceChecked)
          )
        );
      }),

      // #5. update the member, from the source
      TE.chain((member) =>
        performAction(
          member,
          this.memberRepository.save,
          this.errorFactory,
          this.logger,
          `save member from source`
        )
      )
    );

    return executeTask(task);
  }
}
