import { parseExternalIdSourceValue } from '@curioushuman/common';

import { ParticipantId } from '../../../domain/value-objects/participant-id';
import {
  ParticipantIdentifier,
  ParticipantIdentifiers,
} from '../../../domain/entities/participant';
import { Source } from '../../../domain/value-objects/source';
import { ParticipantSourceId } from '../../../domain/value-objects/participant-source-id';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindParticipantDtoTypes = {
  [I in ParticipantIdentifier]: {
    identifier: I;
    value: ParticipantIdentifiers[I];
  };
};

/**
 * A type for the DTO parser function
 */
type FindParticipantDtoParser<I extends ParticipantIdentifier> = (
  dto: FindParticipantDtoTypes[I]
) => ParticipantIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindParticipantDtoParsers = {
  [K in ParticipantIdentifier]: FindParticipantDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindParticipantDtoParsers = {
  id: (dto) => ParticipantId.check(dto.value),
  idSourceValue: (dto) =>
    parseExternalIdSourceValue(dto.value, ParticipantSourceId, Source),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match participantIdentifiers as the parsers object is derived
 * from the original participantIdentifiers type.
 */
export const participantIdentifiers = Object.keys(
  parsers
) as ParticipantIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our Participant entity.
 */
export type FindParticipantDto =
  FindParticipantDtoTypes[keyof FindParticipantDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends ParticipantIdentifier>(
  dto: FindParticipantDtoTypes[I]
) => (parsers[dto.identifier] as FindParticipantDtoParser<I>)(dto);
