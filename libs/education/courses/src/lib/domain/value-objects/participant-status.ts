import { Static } from 'runtypes';
import { ParticipantSourceStatus } from './participant-source-status';

/**
 * ? Should we define the list twice?
 */
export const ParticipantStatus =
  ParticipantSourceStatus.withBrand('ParticipantStatus');

export type ParticipantStatus = Static<typeof ParticipantStatus>;
