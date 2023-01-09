import {
  GroupSourceIdentifier,
  GroupSourceIdentifiers,
} from '../../../domain/entities/group-source';
import { FindGroupSourceMapper } from './find-group-source.mapper';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindGroupSourceDtoTypes = {
  [I in GroupSourceIdentifier]: {
    identifier: I;
    value: GroupSourceIdentifiers[I];
  };
};

/**
 * A type for the DTO parser function
 */
type FindGroupSourceDtoParser<I extends GroupSourceIdentifier> = (
  dto: FindGroupSourceDtoTypes[I]
) => GroupSourceIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindGroupSourceDtoParsers = {
  [K in GroupSourceIdentifier]: FindGroupSourceDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindGroupSourceDtoParsers = {
  // * NOTE: the idSource parser will validate the idSource AND extract id
  idSource: (dto) => FindGroupSourceMapper.fromIdSourceToId(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match groupIdentifiers as the parsers object is derived
 * from the original groupIdentifiers type.
 */
export const groupIdentifiers = Object.keys(parsers) as GroupSourceIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our GroupSource entity.
 */
export type FindGroupSourceDto =
  FindGroupSourceDtoTypes[keyof FindGroupSourceDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends GroupSourceIdentifier>(
  dto: FindGroupSourceDtoTypes[I]
) => (parsers[dto.identifier] as FindGroupSourceDtoParser<I>)(dto);
