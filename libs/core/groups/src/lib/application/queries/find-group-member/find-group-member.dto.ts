import { parseExternalIdSourceValue } from '@curioushuman/common';

import { GroupMemberId } from '../../../domain/value-objects/group-member-id';
import {
  GroupMemberForIdentify,
  GroupMemberIdentifier,
  GroupMemberIdentifiers,
} from '../../../domain/entities/group-member';
import { Source } from '../../../domain/value-objects/source';
import { GroupMemberSourceId } from '../../../domain/value-objects/group-member-source-id';

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
  idSourceValue: (dto) =>
    parseExternalIdSourceValue(dto.value, GroupMemberSourceId, Source),
  entity: (dto) => GroupMemberForIdentify.check(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match groupIdentifiers as the parsers object is derived
 * from the original groupIdentifiers type.
 */
export const groupIdentifiers = Object.keys(parsers) as GroupMemberIdentifier[];

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
