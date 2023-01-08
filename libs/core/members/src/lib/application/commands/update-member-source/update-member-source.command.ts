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

import {
  MemberSourceAuthRepository,
  MemberSourceCommunityRepository,
  MemberSourceCrmRepository,
  MemberSourceMicroCourseRepository,
  MemberSourceRepository,
} from '../../../adapter/ports/member-source.repository';
import { MemberSource } from '../../../domain/entities/member-source';
import { UpdateMemberSourceDto } from './update-member-source.dto';
import { UpdateMemberSourceMapper } from './update-member-source.mapper';

export class UpdateMemberSourceCommand implements ICommand {
  constructor(public readonly updateMemberSourceDto: UpdateMemberSourceDto) {}
}

/**
 * Command handler for update member source
 * TODO
 * - [ ] move the source repository selection to a separate service
 * - [ ] this shouldn't be accepting findDtos, doesn't feel right
 *       requires more thought. Look at upsert for example.
 */
@CommandHandler(UpdateMemberSourceCommand)
export class UpdateMemberSourceHandler
  implements ICommandHandler<UpdateMemberSourceCommand>
{
  constructor(
    private readonly memberSourceAuthRepository: MemberSourceAuthRepository,
    private readonly memberSourceCommunityRepository: MemberSourceCommunityRepository,
    private readonly memberSourceCrmRepository: MemberSourceCrmRepository,
    private readonly memberSourceMicroCourseRepository: MemberSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(UpdateMemberSourceHandler.name);
  }

  async execute(command: UpdateMemberSourceCommand): Promise<MemberSource> {
    const { updateMemberSourceDto } = command;

    // TODO don't do this here, extract it in the fp destructuring below
    const source = updateMemberSourceDto.source;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, MemberSourceRepository> = {
      AUTH: this.memberSourceAuthRepository,
      COMMUNITY: this.memberSourceCommunityRepository,
      CRM: this.memberSourceCrmRepository,
      'MICRO-COURSE': this.memberSourceMicroCourseRepository,
    };

    const task = pipe(
      updateMemberSourceDto,
      // #1. validate the DTO
      parseActionData(
        UpdateMemberSourceDto.check,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. destructure the DTO
      // TODO improve/simplify
      TE.chain((dto) =>
        sequenceT(TE.ApplySeq)(TE.right(dto.member), TE.right(dto.memberSource))
      ),

      // #3. transform
      TE.chain(([member, memberSource]) =>
        pipe(
          member,
          parseActionData(
            UpdateMemberSourceMapper.fromMemberToSource(memberSource),
            this.logger,
            'SourceInvalidError'
          )
        )
      ),

      // #4. update the member source
      TE.chain((ms) =>
        performAction(
          ms,
          sourceRepositories[source].update,
          this.errorFactory,
          this.logger,
          `update member source`
        )
      )
    );

    return executeTask(task);
  }
}
