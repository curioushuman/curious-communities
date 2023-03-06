import { Optional, Record, Static, String } from 'runtypes';
import { RequestSource } from '@curioushuman/common';
import {
  parseParticipantResponseDto,
  ParticipantResponseDto,
} from '../../dto/participant.response.dto';
import { ParticipantSourceIdSourceValue } from '../../../domain/value-objects/participant-source-id-source';

/**
 * This is the form of data we expect as input into our application
 *
 * NOTE: this has been updated to accept strings. As this is the external
 * facing DTO, this will be OK. We then need to validate as we proceed
 * further into application layers.
 */

export const UpdateParticipantRequestDto = Record({
  idSourceValue: Optional(String),
  participant: Optional(ParticipantResponseDto),
  requestSource: Optional(RequestSource),
}).withConstraint((dto) => !!(dto.idSourceValue || dto.participant));

export type UpdateParticipantRequestDto = Static<
  typeof UpdateParticipantRequestDto
>;

/**
 * An alternative parser, instead of UpdateParticipantRequestDto.check()
 *
 * Participant having Course and Member as children proves too much for Runtype.check()
 */
export const parseUpdateParticipantRequestDto = (
  dto: UpdateParticipantRequestDto
): UpdateParticipantRequestDto => {
  const { participant, idSourceValue, requestSource } = dto;

  return {
    participant: participant
      ? parseParticipantResponseDto(participant)
      : undefined,
    idSourceValue: idSourceValue
      ? ParticipantSourceIdSourceValue.check(idSourceValue)
      : undefined,
    requestSource: requestSource
      ? RequestSource.check(requestSource)
      : undefined,
  };
};
