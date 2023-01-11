import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { ErrorFactory } from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { UpdateCourseGroupMemberDto } from './update-course-group-member.dto';
import { GroupMember } from '../../../domain/entities/group-member';
import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';
import { UpdateCourseGroupMemberMapper } from './update-course-group-member.mapper';

export class UpdateCourseGroupMemberCommand implements ICommand {
  constructor(
    public readonly updateCourseGroupMember: UpdateCourseGroupMemberDto
  ) {}
}

/**
 * Command handler for update course group member
 */
@CommandHandler(UpdateCourseGroupMemberCommand)
export class UpdateCourseGroupMemberHandler
  implements ICommandHandler<UpdateCourseGroupMemberCommand>
{
  constructor(
    private readonly groupMemberRepository: GroupMemberRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(UpdateCourseGroupMemberHandler.name);
  }

  async execute(command: UpdateCourseGroupMemberCommand): Promise<GroupMember> {
    // we can destructure at this point
    // as we know the DTO has already been validated prior to this point
    const {
      updateCourseGroupMember: { groupMember },
    } = command;

    const task = pipe(
      // updateCourseGroupMember,
      // #1. validate the dto
      // * NO LONGER NECESSARY, phasing out
      // * this is/should be consistently done in the mapper
      // parseActionData(
      //   UpdateCourseGroupMemberDto.check,
      //   this.logger,
      //   'RequestInvalidError'
      // ),

      // #2. find this group member
      // NOTE: will throw an error if not found
      performAction(
        groupMember,
        this.groupMemberRepository.findOne('entity'),
        this.errorFactory,
        this.logger,
        `check for existing group-member: ${groupMember.email}`
      ),

      // #3. update the group member
      TE.chain((foundGroupMember) =>
        pipe(
          foundGroupMember,
          parseActionData(
            UpdateCourseGroupMemberMapper.toGroupMember(groupMember),
            this.logger,
            'RequestInvalidError'
          )
        )
      ),

      // #4 save the group member
      TE.chain((updatedGm) =>
        performAction(
          updatedGm,
          this.groupMemberRepository.save,
          this.errorFactory,
          this.logger,
          `save GroupMember`
        )
      )
    );

    return executeTask(task);
  }
}
