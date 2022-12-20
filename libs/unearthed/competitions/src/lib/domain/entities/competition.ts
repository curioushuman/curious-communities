import { Optional, Record, Static } from 'runtypes';

import {
  createSlug,
  createYearMonth,
  PositiveInteger,
  Slug,
  Timestamp,
  YearMonth,
} from '@curioushuman/common';

import { CompetitionName } from '../value-objects/competition-name';
import { CompetitionDetails } from '../value-objects/competition-details';
import { CompetitionId } from '../value-objects/competition-id';
import { CompetitionSource } from './competition-source';

/**
 * Runtypes constant for the (internal) Competition entity
 * Used for type checking and validation
 */
export const Competition = Record({
  id: CompetitionId,
  slug: Slug,
  name: CompetitionName,
  details: Optional(CompetitionDetails),
  dateTrackMinimum: Timestamp,
  dateOpen: Timestamp,
  dateClosed: Timestamp,
  yearMonthOpen: YearMonth,
  countEntries: PositiveInteger,
  countEntriesUnmoderated: PositiveInteger,
  countEntriesModerated: PositiveInteger,
  countResultsLongList: PositiveInteger,
  countResultsShortList: PositiveInteger,
  countResultsFinalists: PositiveInteger,
  countResultsWinners: PositiveInteger,
});

/**
 * Type for the (internal) competition entity
 */
export type Competition = Static<typeof Competition>;

export const createCompetitionSlug = (source: CompetitionSource): Slug => {
  const yearMonthOpen = createYearMonth(source.dateOpen);
  return createSlug(`${yearMonthOpen}-${source.name}`);
};

/**
 * Type that defines all the possible identifiers for a competition
 * NOTE: this is utilized in find-competition.dto.ts and competition.repository.ts
 * to define parsers and finders.
 */
export type CompetitionIdentifiers = {
  id: CompetitionId;
  slug: Slug;
};
export type CompetitionIdentifier = keyof CompetitionIdentifiers;
