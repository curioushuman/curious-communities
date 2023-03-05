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
import { MemberDto } from '../dto/member.dto';
import { MemberMapper } from '../member.mapper';
import {
  GroupMemberBaseResponseDto,
  GroupMemberResponseDto,
} from '../dto/group-member.response.dto';
import { GroupBaseResponseDto } from '../dto/group.response.dto';
import { GroupMapper } from '../group.mapper';

/**
 * Controller to handle updating multiple group members
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
   * Updates a group member with the new group data
   * NOTE: we do not update individual fields here, this is used
   * when the group changes, and we want to update all the members
   * with the new group data
   */
  private prepareGroupUpdateDto(
    groupMember: GroupMember,
    group: GroupBaseResponseDto | undefined
  ): GroupBaseResponseDto {
    if (!group) {
      return GroupMapper.toBaseResponseDto(groupMember.group);
    }
    return group;
  }

  /**
   * Updates a group member with new member data
   * NOTE: similarly we are not picking out individual fields
   * at this time.
   */
  private prepareMemberUpdateDto(
    groupMember: GroupMember,
    member: MemberDto | undefined
  ): MemberDto {
    if (!member) {
      return MemberMapper.toResponseDto(groupMember.member);
    }
    return member;
  }

  /**
   * Updates a group member with the mass update
   * OR just passes the group member through if no mass update
   *
   * ! NOTE: we haven't yet implemented this, as we don't yet have a use case
   */
  private prepareGroupMemberUpdateDto(
    groupMember: GroupMember,
    // we'll implement this later
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: GroupMemberResponseDto | undefined
  ): GroupMemberBaseResponseDto {
    return GroupMemberMapper.toBaseResponseDto(groupMember);
    // if (!updatedGroupMember) {
    //   return GroupMemberMapper.toResponseDto(groupMember);
    // }
    // const groupMemberForUpdate = {
    //   ...groupMember,
    // };
    // // overwrite the current data, with the mass update data
    // for (const [key, value] of Object.entries(GroupMemberForMultiUpdate)) {
    //   const groupMemberForUpdateKey = key as keyof GroupMemberForMultiUpdate;
    //   if (groupMember) {
    //     groupMemberForUpdate[groupMemberForUpdateKey] = value.check(
    //       groupMember[groupMemberForUpdateKey]
    //     );
    //   }
    // }
    // return GroupMemberMapper.toBaseResponseDto(groupMemberForUpdate);
  }

  private prepareUpdateDto(
    groupMember: GroupMember,
    validDto: UpdateGroupMemberMultiRequestDto
  ): UpdateGroupMemberRequestDto {
    const groupMemberBase = this.prepareGroupMemberUpdateDto(
      groupMember,
      validDto.groupMember
    );
    const member = this.prepareMemberUpdateDto(groupMember, validDto.member);
    const group = this.prepareGroupUpdateDto(groupMember, validDto.group);
    return {
      groupMember: {
        ...groupMemberBase,
        member,
        group,
      },
    };
  }

  private prepareMessages =
    (groupMembers: GroupMember[]) =>
    (
      validDto: UpdateGroupMemberMultiRequestDto
    ): UpdateGroupMemberRequestDto[] => {
      return groupMembers.map((groupMember) =>
        this.prepareUpdateDto(groupMember, validDto)
      );
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
