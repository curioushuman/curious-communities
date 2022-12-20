import { Static, String } from 'runtypes';

export const CompetitionSourceCriteria = String.withBrand(
  'CompetitionCriteria'
);

export type CompetitionSourceCriteria = Static<
  typeof CompetitionSourceCriteria
>;
