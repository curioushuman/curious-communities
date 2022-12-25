import { MemberIdExternal } from '../../../domain/value-objects/member-id-external';
import {
  MemberIdentifier,
  MemberIdentifiers,
} from '../../../domain/entities/member';
import { MemberSlug } from '../../../domain/value-objects/member-slug';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindMemberDtoTypes = {
  [I in MemberIdentifier]: {
    identifier: I;
    value: MemberIdentifiers[I];
  };
};

/**
 * A type for the DTO parser function
 */
type FindMemberDtoParser<I extends MemberIdentifier> = (
  dto: FindMemberDtoTypes[I]
) => MemberIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindMemberDtoParsers = {
  [K in MemberIdentifier]: FindMemberDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindMemberDtoParsers = {
  externalId: (dto) => MemberIdExternal.check(dto.value),
  slug: (dto) => MemberSlug.check(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match memberIdentifiers as the parsers object is derived
 * from the original memberIdentifiers type.
 */
export const memberIdentifiers = Object.keys(parsers) as MemberIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our Member entity.
 */
export type FindMemberDto = FindMemberDtoTypes[keyof FindMemberDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends MemberIdentifier>(
  dto: FindMemberDtoTypes[I]
) => (parsers[dto.identifier] as FindMemberDtoParser<I>)(dto);
