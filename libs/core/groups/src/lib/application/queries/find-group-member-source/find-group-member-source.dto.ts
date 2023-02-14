import {
  GroupMemberSourceIdentifier,
  GroupMemberSourceIdentifiers,
} from '../../../domain/entities/group-member-source';
import { GroupMemberEmail } from '../../../domain/value-objects/group-member-email';
import { GroupMemberSourceIdSource } from '../../../domain/value-objects/group-member-source-id-source';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { Source } from '../../../domain/value-objects/source';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 *   ...
 * }
 */
type FindGroupMemberSourceDtoTypes = {
  [I in GroupMemberSourceIdentifier]: {
    identifier: I;
    value: GroupMemberSourceIdentifiers[I];
    source: Source;
    // * Required as this is a nested entity
    parentId: GroupSourceId;
  };
};

/**
 * A wrapper for the value, that will also include the parentId
 */
export type FindGroupMemberSourceValue<I extends GroupMemberSourceIdentifier> =
  {
    value: GroupMemberSourceIdentifiers[I];
    parentId: GroupSourceId;
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
  idSource: (dto) => GroupMemberSourceIdSource.check(dto.value),
  email: (dto) => GroupMemberEmail.check(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match groupMemberIdentifiers as the parsers object is derived
 * from the original groupMemberIdentifiers type.
 */
export const groupMemberIdentifiers = Object.keys(
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
): FindGroupMemberSourceValue<I> => ({
  value: (parsers[dto.identifier] as FindGroupMemberSourceDtoParser<I>)(dto),
  parentId: GroupSourceId.check(dto.parentId),
});
