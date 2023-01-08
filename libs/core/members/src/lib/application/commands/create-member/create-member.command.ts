import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import {
  ErrorFactory,
  RepositoryItemConflictError,
} from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { MemberRepository } from '../../../adapter/ports/member.repository';
import { CreateMemberDto } from './create-member.dto';
import { CreateMemberMapper } from './create-member.mapper';
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
import { parseDto as parseMemberDto } from '../../queries/find-member/find-member.dto';
import { parseDto as parseMemberSourceDto } from '../../queries/find-member-source/find-member-source.dto';

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
    private readonly memberSourceAuthRepository: MemberSourceAuthRepository,
    private readonly memberSourceCommunityRepository: MemberSourceCommunityRepository,
    private readonly memberSourceCrmRepository: MemberSourceCrmRepository,
    private readonly memberSourceMicroCourseRepository: MemberSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateMemberHandler.name);
  }

  async execute(command: CreateMemberCommand): Promise<Member> {
    const {
      createMemberDto: { findMemberDto, findMemberSourceDto },
    } = command;

    // * NOTE: currently idSource is the only identifier that is allowed
    // *       to define a specific source for query. Otherwise reverts
    // *       to the primary source.
    const source = findMemberSourceDto.value.source
      ? findMemberSourceDto.value.source
      : config.defaults.primaryAccountSource;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, MemberSourceRepository> = {
      AUTH: this.memberSourceAuthRepository,
      COMMUNITY: this.memberSourceCommunityRepository,
      CRM: this.memberSourceCrmRepository,
      'MICRO-COURSE': this.memberSourceMicroCourseRepository,
    };

    const task = pipe(
      // #1. parse the dto and extract the values
      sequenceT(TE.ApplySeq)(
        parseActionData(
          parseMemberSourceDto,
          this.logger,
          'RequestInvalidError'
        )(findMemberSourceDto),
        parseActionData(
          parseMemberDto,
          this.logger,
          'RequestInvalidError'
        )(findMemberDto)
      ),

      // #2. Find the source, and the member (to be updated)
      TE.chain(([parsedMemberSourceDtoValue, parsedMemberDtoValue]) =>
        sequenceT(TE.ApplySeq)(
          performAction(
            parsedMemberSourceDtoValue,
            sourceRepositories[source].findOne(findMemberSourceDto.identifier),
            this.errorFactory,
            this.logger,
            `find member source: ${findMemberSourceDto.value}`
          ),
          performAction(
            parsedMemberDtoValue,
            this.memberRepository.check(findMemberDto.identifier),
            this.errorFactory,
            this.logger,
            `check for existing member: ${findMemberDto.value}`
          )
        )
      ),

      // #3. validate + transform; members exists, source is valid, source to member
      TE.chain(([memberSource, memberExists]) => {
        if (memberExists === true) {
          throw new RepositoryItemConflictError(
            `Member: ${findMemberDto.value}`
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
              CreateMemberMapper.fromSourceToMember,
              this.logger,
              'SourceInvalidError'
            )(memberSourceChecked)
          )
        );
      }),

      // #5. create the member, from the source
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
