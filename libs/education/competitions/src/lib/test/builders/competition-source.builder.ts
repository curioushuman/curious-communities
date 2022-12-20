import { ExternalId } from '@curioushuman/common';

import { CompetitionSource } from '../../domain/entities/competition-source';

/**
 * A builder for Competition Sources to play with in testing.
 */

/**
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of Competition
 * For the purpose of being able to create invalid Competitions & DTOs and such
 */
type CompetitionSourceLooseMimic = {
  [K in keyof CompetitionSource]?: CompetitionSource[K] | string | number;
};

// timestamps used below
const timestamps: number[] = [];
const dateAgo = new Date();
for (let i = 0; i <= 3; i++) {
  dateAgo.setMonth(dateAgo.getMonth() - i);
  timestamps.push(dateAgo.getTime());
}

export const CompetitionSourceBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: CompetitionSourceLooseMimic = {
    id: '5008s1234519CjIAAU',
    name: 'Learn to be a dancer',
    status: 'ready',
    specificCriteria: 'Be a dancer',
    dateTrackMinimum: timestamps[3],
    dateOpen: timestamps[2],
    dateClosed: timestamps[0],
  };
  const overrides: CompetitionSourceLooseMimic = {
    id: defaultProperties.id,
    name: defaultProperties.name,
    status: defaultProperties.status,
    specificCriteria: defaultProperties.specificCriteria,
    dateTrackMinimum: defaultProperties.dateTrackMinimum,
    dateOpen: defaultProperties.dateOpen,
    dateClosed: defaultProperties.dateClosed,
  };

  return {
    funkyChars() {
      overrides.name = "I'm gonna be a dancer!";
      return this;
    },

    alpha() {
      overrides.id = '5000K1234567GEYQA3';
      overrides.name = 'Dance, like an alpha';
      return this;
    },

    beta() {
      overrides.id = '5008s000000y7LUAAY';
      overrides.name = 'Beta ray dancing';
      return this;
    },

    noMatchingSource() {
      return this;
    },

    invalidStatus() {
      overrides.name = 'Pending competition';
      overrides.status = 'pending';
      return this;
    },

    invalidSource() {
      overrides.name = '';
      return this;
    },

    exists() {
      overrides.id = ExternalId.check('ThisSourceExists');
      return this;
    },

    build(): CompetitionSource {
      return CompetitionSource.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): CompetitionSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as CompetitionSource;
    },
  };
};
