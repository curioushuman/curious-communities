import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { GroupMemberMessagingService } from '../../adapter/ports/group-member.messaging-service';
import { UpdateGroupMemberMultiRequestDto } from './dto/update-group-member-multi.request.dto';
import { GroupMember } from '../../domain/entities/group-member';
import { FindGroupMembersMapper } from '../../application/queries/find-group-members/find-group-members.mapper';
import { FindGroupMembersQuery } from '../../application/queries/find-group-members/find-group-members.query';
import { UpdateGroupMemberRequestDto } from '../update-group-member/dto/update-group-member.request.dto';
import { GroupMemberMapper } from '../group-member.mapper';

/**
 * Controller to handle updating multiple member sources of a single group
 *
 * TODO:
 * - [ ] whole thing could be done in fp-ts
 */
@Controller()
export class UpdateGroupMemberMultiController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus,
    private messagingService: GroupMemberMessagingService
  ) {
    this.logger.setContext(UpdateGroupMemberMultiController.name);
  }

  /**
   * Updates a group member with the mass update
   * OR just passes the group member through if no mass update
   */
  private prepareUpdateDto(
    member: GroupMember,
    validDto: UpdateGroupMemberMultiRequestDto
  ): UpdateGroupMemberRequestDto {
    // overwrite the current data, with the mass update data
    const groupMember = validDto.groupMemberUpdate
      ? {
          ...member,
          ...validDto.groupMemberUpdate,
        }
      : member;
    return {
      groupMember: GroupMemberMapper.toResponseDto(groupMember),
      requestSource: 'internal',
    };
  }

  private prepareMessages =
    (members: GroupMember[]) =>
    (
      validDto: UpdateGroupMemberMultiRequestDto
    ): UpdateGroupMemberRequestDto[] => {
      return members.map((member) => this.prepareUpdateDto(member, validDto));
    };

  public async update(
    requestDto: UpdateGroupMemberMultiRequestDto
  ): Promise<void> {
    // #1. validate dto
    const validDto = pipe(
      requestDto,
      parseData(UpdateGroupMemberMultiRequestDto.check, this.logger)
    );

    // #2. find the members
    const members = await this.findGroupMembers(validDto);

    const task = pipe(
      validDto,
      // #3. prepare the messages
      this.prepareMessages(members),
      // #4. send the messages
      this.messagingService.sendMessageBatch
    );

    return executeTask(task);
  }

  private findGroupMembers(
    validDto: UpdateGroupMemberMultiRequestDto
  ): Promise<GroupMember[]> {
    const task = pipe(
      validDto,

      // #1. transform dto
      parseActionData(
        FindGroupMembersMapper.fromUpdateGroupMemberMultiRequestDto,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. call the query
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindGroupMembersQuery(findDto);
              return await this.queryBus.execute<FindGroupMembersQuery>(query);
            },
            (error: unknown) => error as Error
          )
        )
      )
    );

    return executeTask(task);
  }
}
