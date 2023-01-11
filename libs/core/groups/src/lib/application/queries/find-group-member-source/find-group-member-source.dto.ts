import { GroupMemberForSourceIdentify } from '../../../domain/entities/group-member';
import {
  GroupMemberSourceIdentifier,
  GroupMemberSourceIdentifiers,
} from '../../../domain/entities/group-member-source';
import { Source } from '../../../domain/value-objects/source';
import { FindGroupMemberSourceMapper } from './find-group-member-source.mapper';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindGroupMemberSourceDtoTypes = {
  [I in GroupMemberSourceIdentifier]: {
    identifier: I;
    value: GroupMemberSourceIdentifiers[I];
    source: Source;
  };
};

/**
 * A type for the DTO parser function
 */
type FindGroupMemberSourceDtoParser<I extends GroupMemberSourceIdentifier> = (
  dto: FindGroupMemberSourceDtoTypes[I]
) => GroupMemberSourceIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindGroupMemberSourceDtoParsers = {
  [K in GroupMemberSourceIdentifier]: FindGroupMemberSourceDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindGroupMemberSourceDtoParsers = {
  // * NOTE: the idSource parser will validate the idSource AND extract id
  idSource: (dto) => FindGroupMemberSourceMapper.fromIdSourceToId(dto.value),
  entity: (dto) => GroupMemberForSourceIdentify.check(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match groupIdentifiers as the parsers object is derived
 * from the original groupIdentifiers type.
 */
export const groupIdentifiers = Object.keys(
  parsers
) as GroupMemberSourceIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our GroupMemberSource entity.
 */
export type FindGroupMemberSourceDto =
  FindGroupMemberSourceDtoTypes[keyof FindGroupMemberSourceDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends GroupMemberSourceIdentifier>(
  dto: FindGroupMemberSourceDtoTypes[I]
) => (parsers[dto.identifier] as FindGroupMemberSourceDtoParser<I>)(dto);
