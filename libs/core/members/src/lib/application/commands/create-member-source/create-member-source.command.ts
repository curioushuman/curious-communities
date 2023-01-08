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
import { CreateMemberSourceDto } from './create-member-source.dto';
import { CreateMemberSourceMapper } from './create-member-source.mapper';

export class CreateMemberSourceCommand implements ICommand {
  constructor(public readonly createMemberSourceDto: CreateMemberSourceDto) {}
}

/**
 * Command handler for create member source
 * TODO
 * - [ ] move the source repository selection to a separate service
 * - [ ] this shouldn't be accepting findDtos, doesn't feel right
 *       requires more thought. Look at upsert for example.
 */
@CommandHandler(CreateMemberSourceCommand)
export class CreateMemberSourceHandler
  implements ICommandHandler<CreateMemberSourceCommand>
{
  constructor(
    private readonly memberSourceAuthRepository: MemberSourceAuthRepository,
    private readonly memberSourceCommunityRepository: MemberSourceCommunityRepository,
    private readonly memberSourceCrmRepository: MemberSourceCrmRepository,
    private readonly memberSourceMicroCourseRepository: MemberSourceMicroCourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateMemberSourceHandler.name);
  }

  async execute(command: CreateMemberSourceCommand): Promise<MemberSource> {
    const { createMemberSourceDto } = command;

    // TODO don't do this here, extract it in the fp destructuring below
    const source = createMemberSourceDto.source;

    // TODO this must be improved/moved at some later point
    const sourceRepositories: Record<string, MemberSourceRepository> = {
      AUTH: this.memberSourceAuthRepository,
      COMMUNITY: this.memberSourceCommunityRepository,
      CRM: this.memberSourceCrmRepository,
      'MICRO-COURSE': this.memberSourceMicroCourseRepository,
    };

    const task = pipe(
      createMemberSourceDto,
      // #1. validate the DTO
      parseActionData(
        CreateMemberSourceDto.check,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. destructure the DTO
      // TODO improve/simplify
      TE.chain((dto) => sequenceT(TE.ApplySeq)(TE.right(dto.member))),

      // #3. transform
      TE.chain(([member]) =>
        pipe(
          member,
          parseActionData(
            CreateMemberSourceMapper.fromMemberToSource,
            this.logger,
            'RequestInvalidError'
          )
        )
      ),

      // #4. create the member source
      TE.chain((memberSourceForCreate) =>
        performAction(
          memberSourceForCreate,
          sourceRepositories[source].create,
          this.errorFactory,
          this.logger,
          `save member source`
        )
      )
    );

    return executeTask(task);
  }
}
