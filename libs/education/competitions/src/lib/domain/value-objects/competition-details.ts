import { Optional, Record, Static } from 'runtypes';

import { CompetitionSourceCriteria } from './competition-source-criteria';

export const CompetitionDetails = Record({
  specificCriteria: Optional(CompetitionSourceCriteria),
});

export type CompetitionDetails = Static<typeof CompetitionDetails>;
