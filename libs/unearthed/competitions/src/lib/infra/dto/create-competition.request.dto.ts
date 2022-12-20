import { Record, Static } from 'runtypes';

import { CompetitionId } from '../../domain/value-objects/competition-id';
/**
 * This is the form of data we expect as input into our API/Request
 */

export const CreateCompetitionRequestDto = Record({
  id: CompetitionId,
});

export type CreateCompetitionRequestDto = Static<
  typeof CreateCompetitionRequestDto
>;
