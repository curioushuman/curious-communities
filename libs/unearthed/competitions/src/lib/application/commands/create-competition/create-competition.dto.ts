import { Record, Static } from 'runtypes';

import { CompetitionId } from '../../../domain/value-objects/competition-id';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateCompetitionDto = Record({
  id: CompetitionId,
});

export type CreateCompetitionDto = Static<typeof CreateCompetitionDto>;
