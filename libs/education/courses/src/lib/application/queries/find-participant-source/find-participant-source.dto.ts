import {
  ParticipantSourceIdentifier,
  ParticipantSourceIdentifiers,
} from '../../../domain/entities/participant-source';
import { ParticipantSourceIdSource } from '../../../domain/value-objects/participant-source-id-source';
import { Source } from '../../../domain/value-objects/source';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindParticipantSourceDtoTypes = {
  [I in ParticipantSourceIdentifier]: {
    identifier: I;
    value: ParticipantSourceIdentifiers[I];
    source: Source;
  };
};

/**
 * A type for the DTO parser function
 */
type FindParticipantSourceDtoParser<I extends ParticipantSourceIdentifier> = (
  dto: FindParticipantSourceDtoTypes[I]
) => ParticipantSourceIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindParticipantSourceDtoParsers = {
  [K in ParticipantSourceIdentifier]: FindParticipantSourceDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindParticipantSourceDtoParsers = {
  idSource: (dto) => ParticipantSourceIdSource.check(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match participantIdentifiers as the parsers object is derived
 * from the original participantIdentifiers type.
 */
export const participantIdentifiers = Object.keys(
  parsers
) as ParticipantSourceIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our ParticipantSource entity.
 */
export type FindParticipantSourceDto =
  FindParticipantSourceDtoTypes[keyof FindParticipantSourceDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends ParticipantSourceIdentifier>(
  dto: FindParticipantSourceDtoTypes[I]
) => (parsers[dto.identifier] as FindParticipantSourceDtoParser<I>)(dto);
