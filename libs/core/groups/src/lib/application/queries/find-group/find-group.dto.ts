import { parseExternalIdSourceValue } from '@curioushuman/common';

import { GroupId } from '../../../domain/value-objects/group-id';
import {
  GroupIdentifier,
  GroupIdentifiers,
} from '../../../domain/entities/group';
import { Source } from '../../../domain/value-objects/source';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { GroupSlug } from '../../../domain/value-objects/group-slug';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindGroupDtoTypes = {
  [I in GroupIdentifier]: {
    identifier: I;
    value: GroupIdentifiers[I];
  };
};

/**
 * A type for the DTO parser function
 */
type FindGroupDtoParser<I extends GroupIdentifier> = (
  dto: FindGroupDtoTypes[I]
) => GroupIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindGroupDtoParsers = {
  [K in GroupIdentifier]: FindGroupDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindGroupDtoParsers = {
  id: (dto) => GroupId.check(dto.value),
  idSourceValue: (dto) =>
    parseExternalIdSourceValue(dto.value, GroupSourceId, Source),
  slug: (dto) => GroupSlug.check(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match groupIdentifiers as the parsers object is derived
 * from the original groupIdentifiers type.
 */
export const groupIdentifiers = Object.keys(parsers) as GroupIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our Group entity.
 */
export type FindGroupDto = FindGroupDtoTypes[keyof FindGroupDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends GroupIdentifier>(
  dto: FindGroupDtoTypes[I]
) => (parsers[dto.identifier] as FindGroupDtoParser<I>)(dto);
