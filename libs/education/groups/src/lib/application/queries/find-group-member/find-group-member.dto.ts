import { GroupMemberId } from '../../../domain/value-objects/group-member-id';
import {
  GroupMemberIdentifier,
  GroupMemberIdentifiers,
} from '../../../domain/entities/group-member';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindGroupMemberDtoTypes = {
  [I in GroupMemberIdentifier]: {
    identifier: I;
    value: GroupMemberIdentifiers[I];
  };
};

/**
 * A type for the DTO parser function
 */
type FindGroupMemberDtoParser<I extends GroupMemberIdentifier> = (
  dto: FindGroupMemberDtoTypes[I]
) => GroupMemberIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindGroupMemberDtoParsers = {
  [K in GroupMemberIdentifier]: FindGroupMemberDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindGroupMemberDtoParsers = {
  id: (dto) => GroupMemberId.check(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match groupMemberIdentifiers as the parsers object is derived
 * from the original groupMemberIdentifiers type.
 */
export const groupMemberIdentifiers = Object.keys(
  parsers
) as GroupMemberIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our GroupMember entity.
 */
export type FindGroupMemberDto =
  FindGroupMemberDtoTypes[keyof FindGroupMemberDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends GroupMemberIdentifier>(
  dto: FindGroupMemberDtoTypes[I]
) => (parsers[dto.identifier] as FindGroupMemberDtoParser<I>)(dto);
