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

import { GroupMemberRepository } from '../../../adapter/ports/group-member.repository';
import { UpdateGroupMemberDto } from './update-group-member.dto';
import { UpdateGroupMemberMapper } from './update-group-member.mapper';
import { GroupMemberSourceRepository } from '../../../adapter/ports/group-member-source.repository';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { GroupMemberMapper } from '../../group-member.mapper';

export class UpdateGroupMemberCommand implements ICommand {
  constructor(public readonly updateGroupMemberDto: UpdateGroupMemberDto) {}
}

/**
 * Command handler for update group-member
 * TODO
 * - [ ] better associated group-member check
 *       e.g. check against local IDs rather than just existence of group-memberId
 */
@CommandHandler(UpdateGroupMemberCommand)
export class UpdateGroupMemberHandler
  implements ICommandHandler<UpdateGroupMemberCommand>
{
  constructor(
    private readonly groupMemberRepository: GroupMemberRepository,
    private readonly groupMemberSourceRepository: GroupMemberSourceRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(UpdateGroupMemberHandler.name);
  }

  async execute(command: UpdateGroupMemberCommand): Promise<void> {
    const { updateGroupMemberDto } = command;

    const task = pipe(
      // #1. parse the dto
      // we want two DTOs 1. to find source, and 2. find group-member
      sequenceT(TE.ApplySeq)(
        parseActionData(
          UpdateGroupMemberMapper.toFindGroupMemberSourceDto,
          this.logger,
          'RequestInvalidError'
        )(updateGroupMemberDto),
        parseActionData(
          UpdateGroupMemberMapper.toFindGroupMemberDto,
          this.logger,
          'RequestInvalidError'
        )(updateGroupMemberDto)
      ),

      // #2. Find the source, and the group-member (to be updated)
      TE.chain(([findGroupMemberSourceDto, findGroupMemberDto]) =>
        sequenceT(TE.ApplySeq)(
          performAction(
            findGroupMemberSourceDto,
            this.groupMemberSourceRepository.findOne,
            this.errorFactory,
            this.logger,
            `find group-member source: ${findGroupMemberSourceDto.id}`
          ),
          performAction(
            findGroupMemberDto.value,
            this.groupMemberRepository.checkById,
            this.errorFactory,
            this.logger,
            `find group-member: ${findGroupMemberDto.value}`
          )
        )
      ),

      // #3. validate + transform; group-members exists, source is valid, source to group-member
      TE.chain(([groupMemberSource, groupMemberExists]) => {
        if (!groupMemberSource) {
          throw new RepositoryItemNotFoundError(
            `GroupMember source id: ${updateGroupMemberDto.id}`
          );
        }
        if (groupMemberExists === false) {
          throw new RepositoryItemNotFoundError(
            `GroupMember id: ${updateGroupMemberDto.id}`
          );
        }
        return pipe(
          groupMemberSource,
          parseActionData(
            GroupMemberSource.check,
            this.logger,
            'SourceInvalidError'
          ),
          TE.chain((groupMemberSourceChecked) =>
            parseActionData(
              GroupMemberMapper.fromSourceToGroupMember,
              this.logger,
              'SourceInvalidError'
            )(groupMemberSourceChecked)
          )
        );
      }),

      // #5. update the group-member, from the source
      TE.chain((groupMember) =>
        performAction(
          groupMember,
          this.groupMemberRepository.save,
          this.errorFactory,
          this.logger,
          `save group-member from source`
        )
      )
    );

    return executeTask(task);
  }
}
