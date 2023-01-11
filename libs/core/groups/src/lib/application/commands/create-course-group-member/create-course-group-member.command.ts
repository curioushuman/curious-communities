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

import { CreateCourseGroupMemberDto } from './create-course-group-member.dto';
import {
  GroupMember,
  GroupMemberBase,
} from '../../../domain/entities/group-member';
import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';

export class CreateCourseGroupMemberCommand implements ICommand {
  constructor(
    public readonly createCourseGroupMember: CreateCourseGroupMemberDto
  ) {}
}

/**
 * Command handler for create course group
 */
@CommandHandler(CreateCourseGroupMemberCommand)
export class CreateCourseGroupMemberHandler
  implements ICommandHandler<CreateCourseGroupMemberCommand>
{
  constructor(
    private readonly groupMemberRepository: GroupMemberRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateCourseGroupMemberHandler.name);
  }

  async execute(command: CreateCourseGroupMemberCommand): Promise<GroupMember> {
    const { createCourseGroupMember } = command;

    const task = pipe(
      createCourseGroupMember,
      // #1. validate the dto
      parseActionData(
        CreateCourseGroupMemberDto.check,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. check if the course group-member already exists
      TE.chain(
        // we can safely destruct the dto here, because we know it's valid
        ({ groupMember }) =>
          sequenceT(TE.ApplySeq)(
            parseActionData(
              GroupMemberBase.check,
              this.logger,
              'RequestInvalidError'
            )(groupMember),
            performAction(
              groupMember,
              this.groupMemberRepository.check,
              this.errorFactory,
              this.logger,
              `check for existing group-member: ${groupMember.email}`
            )
          )
      ),

      // #3. if the group-member exists, throw an error
      // otherwise create the group-member
      TE.chain(([gm, groupMemberExists]) => {
        if (groupMemberExists === true) {
          throw new RepositoryItemConflictError(`GroupMember: ${gm.email}`);
        }
        return performAction(
          gm,
          this.groupMemberRepository.save,
          this.errorFactory,
          this.logger,
          `save GroupMember`
        );
      })
    );

    return executeTask(task);
  }
}
