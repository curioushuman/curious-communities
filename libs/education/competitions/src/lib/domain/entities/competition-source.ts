import { Optional, Record, Static } from 'runtypes';

import { Timestamp } from '@curioushuman/common';

import { CompetitionName } from '../value-objects/competition-name';
import { CompetitionSourceCriteria } from '../value-objects/competition-source-criteria';
import { CompetitionSourceStatus } from '../value-objects/competition-source-status';
import { CompetitionId } from '../value-objects/competition-id';

export const CompetitionSource = Record({
  id: CompetitionId,
  name: CompetitionName,
  status: CompetitionSourceStatus,
  specificCriteria: Optional(CompetitionSourceCriteria),
  dateTrackMinimum: Timestamp,
  dateOpen: Timestamp,
  dateClosed: Timestamp,
});

export type CompetitionSource = Static<typeof CompetitionSource>;

// competitionId must in fact be empty when we are creating a competition (from source)
const sourceForCreate = Record({
  status: CompetitionSourceStatus.withConstraint(
    (status) =>
      status === 'ready' ||
      `Source competition not in a ready state, therefore could not be created.`
  ),
});
export const CompetitionSourceForCreate =
  sourceForCreate.And(CompetitionSource);

export type CompetitionSourceForCreate = Static<
  typeof CompetitionSourceForCreate
>;
