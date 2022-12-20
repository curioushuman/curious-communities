import { Record, Static } from 'runtypes';

import { CompetitionId } from '../../domain/value-objects/competition-id';

/**
 * This is the form of data we expect as input into our API/Request
 */

export const FindCompetitionSourceRequestDto = Record({
  id: CompetitionId,
});

export type FindCompetitionSourceRequestDto = Static<
  typeof FindCompetitionSourceRequestDto
>;
