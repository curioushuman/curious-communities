import { Record, Static, String } from 'runtypes';
import { Source } from '../../../domain/value-objects/source';
import {
  GroupMemberBaseResponseDto,
  GroupMemberResponseDto,
  parseGroupMemberResponseDto,
} from '../../dto/group-member.response.dto';

/**
 * Currently within the application we could be passed a base version of the group member
 * or a full version of the group member. In the future, we want full only... But we're not
 * there yet.
 *
 * So, allow the acceptance of both. Convert to the full, and then move on with the function.
 */
export const UpsertGroupMemberSourceFromBaseRequestDto = Record({
  source: String,
  groupMember: GroupMemberBaseResponseDto,
});

export type UpsertGroupMemberSourceFromBaseRequestDto = Static<
  typeof UpsertGroupMemberSourceFromBaseRequestDto
>;

/**
 * THis is where we would like to be in the future, no longer accepting the base
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
 * This is the type the controller will (currently) ingest
 */
export type UpsertGroupMemberSourceRequestDtoInput =
  | UpsertGroupMemberSourceFromBaseRequestDto
  | UpsertGroupMemberSourceRequestDto;

/**
 * An alternative parser, instead of UpsertGroupMemberSourceRequestDto.check()
 *
 * GroupMember being a Union and a Composite I think has proven too much
 */
export const parseUpsertGroupMemberSourceFromBaseRequestDto = (
  dto: UpsertGroupMemberSourceFromBaseRequestDto
): UpsertGroupMemberSourceFromBaseRequestDto => {
  const { groupMember, source } = dto;
  return {
    source: Source.check(source),
    groupMember: GroupMemberBaseResponseDto.check(groupMember),
  };
};

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
