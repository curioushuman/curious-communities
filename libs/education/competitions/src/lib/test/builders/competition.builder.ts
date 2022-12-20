import { createYearMonth, Timestamp } from '@curioushuman/common';

import {
  Competition,
  createCompetitionSlug,
} from '../../domain/entities/competition';
import { CompetitionSource } from '../../domain/entities/competition-source';
import { CompetitionResponseDto } from '../../infra/dto/competition.response.dto';
import { CreateCompetitionRequestDto } from '../../infra/dto/create-competition.request.dto';
import { CreateCompetitionDto } from '../../application/commands/create-competition/create-competition.dto';
import { CompetitionSourceBuilder } from './competition-source.builder';

/**
 * A builder for Competitions to play with in testing.
 *
 * NOTES
 * - We include alphas, betas etc to overcome duplicates during testing
 *
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of Competition
 * For the purpose of being able to create invalid Competitions & DTOs and such
 */
type CompetitionLooseMimic = {
  [K in keyof Competition]?: Competition[K] | string | number | object;
};

// timestamps used below
const timestamps: number[] = [];
const dateAgo = new Date();
for (let i = 0; i <= 3; i++) {
  dateAgo.setMonth(dateAgo.getMonth() - i);
  timestamps.push(dateAgo.getTime());
}

export const CompetitionBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: CompetitionLooseMimic = {
    id: '5008s1234519CjIAAU',
    slug: 'learn-to-be-a-dancer',
    name: 'Learn to be a dancer',
    details: {
      specificCriteria: 'Be a dancer',
    },
    dateTrackMinimum: timestamps[3],
    dateOpen: timestamps[2],
    dateClosed: timestamps[0],
    yearMonthOpen: createYearMonth(timestamps[2] as Timestamp),
    countEntries: 0,
    countEntriesUnmoderated: 0,
    countEntriesModerated: 0,
    countResultsLongList: 0,
    countResultsShortList: 0,
    countResultsFinalists: 0,
    countResultsWinners: 0,
  };
  const overrides: CompetitionLooseMimic = {
    id: defaultProperties.id,
    slug: defaultProperties.slug,
    name: defaultProperties.name,
    details: defaultProperties.details,
    dateTrackMinimum: defaultProperties.dateTrackMinimum,
    dateOpen: defaultProperties.dateOpen,
    dateClosed: defaultProperties.dateClosed,
    yearMonthOpen: defaultProperties.yearMonthOpen,
    countEntries: defaultProperties.countEntries,
    countEntriesUnmoderated: defaultProperties.countEntriesUnmoderated,
    countEntriesModerated: defaultProperties.countEntriesModerated,
    countResultsLongList: defaultProperties.countResultsLongList,
    countResultsShortList: defaultProperties.countResultsShortList,
    countResultsFinalists: defaultProperties.countResultsFinalists,
    countResultsWinners: defaultProperties.countResultsWinners,
  };

  return {
    funkyChars() {
      const source = CompetitionSourceBuilder().funkyChars().buildNoCheck();
      overrides.name = source.name;
      overrides.slug = createCompetitionSlug(source);
      return this;
    },

    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = CompetitionSourceBuilder().alpha().buildNoCheck();
      overrides.id = source.id;
      overrides.name = source.name;
      overrides.slug = createCompetitionSlug(source);
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = CompetitionSourceBuilder().alpha().buildNoCheck();
      overrides.id = source.id;
      overrides.name = source.name;
      overrides.slug = createCompetitionSlug(source);
      return this;
    },

    invalidSource() {
      overrides.id = CompetitionSourceBuilder()
        .invalidSource()
        .buildNoCheck().id;
      return this;
    },

    invalidStatus() {
      overrides.id = CompetitionSourceBuilder()
        .invalidStatus()
        .buildNoCheck().id;
      return this;
    },

    noMatchingSource() {
      overrides.id = 'NoMatchingSource';
      return this;
    },

    invalid() {
      delete defaultProperties.id;
      delete overrides.id;
      delete defaultProperties.slug;
      delete overrides.slug;
      return this;
    },

    exists() {
      overrides.id = CompetitionSourceBuilder().exists().build().id;
      return this;
    },

    doesntExist() {
      overrides.id = 'CompetitionDoesntExist';
      overrides.slug = 'competition-doesnt-exist';
      delete defaultProperties.id;
      delete overrides.id;
      return this;
    },

    doesntExistId() {
      overrides.id = '1e72ef98-f21e-4e0a-aff1-a45ed7328123';
      delete defaultProperties.id;
      delete overrides.id;
      delete defaultProperties.slug;
      delete overrides.slug;
      return this;
    },

    fromSource(source: CompetitionSource) {
      overrides.id = source.id;
      overrides.name = source.name;
      overrides.slug = createCompetitionSlug(source);
      return this;
    },

    build(): Competition {
      return Competition.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): Competition {
      return {
        ...defaultProperties,
        ...overrides,
      } as Competition;
    },

    buildCreateCompetitionDto(): CreateCompetitionDto {
      return {
        id: this.build().id,
      } as CreateCompetitionDto;
    },

    buildCreateCompetitionRequestDto(): CreateCompetitionRequestDto {
      return {
        id: this.buildNoCheck().id,
      } as CreateCompetitionRequestDto;
    },

    buildCompetitionResponseDto(): CompetitionResponseDto {
      return {
        ...defaultProperties,
        ...overrides,
      } as CompetitionResponseDto;
    },
  };
};
