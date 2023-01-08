import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import { ErrorFactory } from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { MemberRepository } from '../../../adapter/ports/member.repository';
import { UpdateMemberDto } from './update-member.dto';
import { UpdateMemberMapper } from './update-member.mapper';
import {
  MemberSourceAuthRepository,
  MemberSourceCommunityRepository,
  MemberSourceCrmRepository,
  MemberSourceMicroCourseRepository,
  MemberSourceRepository,
} from '../../../adapter/ports/member-source.repository';
import { MemberSource } from '../../../domain/entities/member-source';
import { Member } from '../../../domain/entities/member';
import config from '../../../static/config';
import { parseDto as parseMemberSourceDto } from '../../queries/find-member-source/find-member-source.dto';

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
    private readonly memberSourceAuthRepository: MemberSourceAuthRepository,
    private readonly memberSourceCommunityRepository: MemberSourceCommunityRepository,
    private readonly memberSourceCrmRepository: MemberSourceCrmRepository,
    private readonly memberSourceMicroCourseRepository: MemberSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(UpdateMemberHandler.name);
  }

  async execute(command: UpdateMemberCommand): Promise<Member> {
    const { updateMemberDto } = command;

    // * NOTE: currently idSource is the only identifier that is allowed
    // *       to define a specific source for query. Otherwise reverts
    // *       to the primary source.
    const source = updateMemberDto.source
      ? updateMemberDto.source
      : config.defaults.primaryAccountSource;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, MemberSourceRepository> = {
      AUTH: this.memberSourceAuthRepository,
      COMMUNITY: this.memberSourceCommunityRepository,
      CRM: this.memberSourceCrmRepository,
      'MICRO-COURSE': this.memberSourceMicroCourseRepository,
    };

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
            // ! this is a bit not-normal
            // this is the only place we do parseMemberSourceDto here
            // TODO: make this more consistent with the rest
            parseMemberSourceDto(findMemberSourceDto),
            sourceRepositories[source].findOne(findMemberSourceDto.identifier),
            this.errorFactory,
            this.logger,
            `find member source: ${findMemberSourceDto.value}`
          ),
          performAction(
            findMemberDto.value,
            this.memberRepository.findOne(findMemberDto.identifier),
            this.errorFactory,
            this.logger,
            `find member: ${findMemberDto.value}`
          )
        )
      ),

      // #3. validate + transform; members exists, source is valid, source to member
      TE.chain(([memberSource, existingMember]) =>
        pipe(
          memberSource,
          parseActionData(
            MemberSource.check,
            this.logger,
            'SourceInvalidError'
          ),
          TE.chain((memberSourceChecked) =>
            parseActionData(
              UpdateMemberMapper.fromSourceToMember(existingMember),
              this.logger,
              'SourceInvalidError'
            )(memberSourceChecked)
          )
        )
      ),

      // #4. update the member, from the source
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
