import { Slug } from '@curioushuman/common';

import { CompetitionId } from '../../../domain/value-objects/competition-id';
import {
  CompetitionIdentifier,
  CompetitionIdentifiers,
} from '../../../domain/entities/competition';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindCompetitionDtoTypes = {
  [I in CompetitionIdentifier]: {
    identifier: I;
    value: CompetitionIdentifiers[I];
  };
};

/**
 * A type for the DTO parser function
 */
type FindCompetitionDtoParser<I extends CompetitionIdentifier> = (
  dto: FindCompetitionDtoTypes[I]
) => CompetitionIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindCompetitionDtoParsers = {
  [K in CompetitionIdentifier]: FindCompetitionDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindCompetitionDtoParsers = {
  id: (dto) => CompetitionId.check(dto.value),
  slug: (dto) => Slug.check(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match competitionIdentifiers as the parsers object is derived
 * from the original competitionIdentifiers type.
 */
export const competitionIdentifiers = Object.keys(
  parsers
) as CompetitionIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our Competition entity.
 */
export type FindCompetitionDto =
  FindCompetitionDtoTypes[keyof FindCompetitionDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends CompetitionIdentifier>(
  dto: FindCompetitionDtoTypes[I]
) => (parsers[dto.identifier] as FindCompetitionDtoParser<I>)(dto);
