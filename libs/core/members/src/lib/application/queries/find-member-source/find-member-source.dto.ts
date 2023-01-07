import {
  MemberSourceIdentifier,
  MemberSourceIdentifiers,
} from '../../../domain/entities/member-source';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { FindMemberSourceMapper } from './find-member-source.mapper';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindMemberSourceDtoTypes = {
  [I in MemberSourceIdentifier]: {
    identifier: I;
    value: MemberSourceIdentifiers[I];
  };
};

/**
 * A type for the DTO parser function
 */
type FindMemberSourceDtoParser<I extends MemberSourceIdentifier> = (
  dto: FindMemberSourceDtoTypes[I]
) => MemberSourceIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindMemberSourceDtoParsers = {
  [K in MemberSourceIdentifier]: FindMemberSourceDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindMemberSourceDtoParsers = {
  // * NOTE: the idSource parser will validate the idSource AND extract id
  idSource: (dto) => FindMemberSourceMapper.fromIdSourceToId(dto.value),
  email: (dto) => MemberEmail.check(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match memberIdentifiers as the parsers object is derived
 * from the original memberIdentifiers type.
 */
export const memberIdentifiers = Object.keys(
  parsers
) as MemberSourceIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our MemberSource entity.
 */
export type FindMemberSourceDto =
  FindMemberSourceDtoTypes[keyof FindMemberSourceDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends MemberSourceIdentifier>(
  dto: FindMemberSourceDtoTypes[I]
) => (parsers[dto.identifier] as FindMemberSourceDtoParser<I>)(dto);
