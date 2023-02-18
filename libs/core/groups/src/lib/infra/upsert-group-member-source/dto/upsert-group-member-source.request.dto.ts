import { Record, Static, String } from 'runtypes';
import { Source } from '../../../domain/value-objects/source';
import {
  GroupMemberResponseDto,
  parseGroupMemberResponseDto,
} from '../../dto/group-member.response.dto';

/**
 * Externally facing DTO for upsert function
 *
 * TODO
 * - [ ] find a better way for this module to know what source it uses
 */

export const UpsertGroupMemberSourceRequestDto = Record({
  source: String,
  groupMember: GroupMemberResponseDto,
});

export type UpsertGroupMemberSourceRequestDto = Static<
  typeof UpsertGroupMemberSourceRequestDto
>;

/**
 * An alternative parser, instead of UpsertGroupMemberSourceRequestDto.check()
 *
 * GroupMember being a Union and a Composite I think has proven too much
 */
export const parseUpsertGroupMemberSourceRequestDto = (
  dto: UpsertGroupMemberSourceRequestDto
): UpsertGroupMemberSourceRequestDto => {
  const { groupMember, source } = dto;
  return {
    source: Source.check(source),
    groupMember: parseGroupMemberResponseDto(groupMember),
  };
};
