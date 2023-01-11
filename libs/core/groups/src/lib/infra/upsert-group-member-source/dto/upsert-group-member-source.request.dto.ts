import { Record, Static, String } from 'runtypes';
import { Source } from '../../../domain/value-objects/source';
import {
  GroupMemberBaseResponseDto,
  GroupMemberResponseDto,
} from '../../dto/group-member.response.dto';
import { GroupBaseResponseDto } from '../../dto/group.response.dto';

/**
 * Externally facing DTO for find function
 */

export const UpsertGroupMemberSourceRequestDto = Record({
  source: String,
  groupMember: GroupMemberResponseDto,
});

export type UpsertGroupMemberSourceRequestDto = Static<
  typeof UpsertGroupMemberSourceRequestDto
>;

/**
 * Custom validator/parser as UpsertGroupMemberSourceRequestDto.check
 * is having some issues.
 */
export const checkUpsertGroupMemberSourceRequestDto = (
  dto: UpsertGroupMemberSourceRequestDto
) => {
  const { group, ...groupMemberBaseResponseDto } = dto.groupMember;
  const validGroupMemberBase = GroupMemberBaseResponseDto.check(
    groupMemberBaseResponseDto
  );
  const validGroupBaseResponseDto = GroupBaseResponseDto.check(group);
  const groupMember = {
    ...validGroupMemberBase,
    group: validGroupBaseResponseDto,
  };
  const source = Source.check(dto.source);
  return { source, groupMember };
};
