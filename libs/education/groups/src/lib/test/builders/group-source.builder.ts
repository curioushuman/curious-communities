import { ExternalId } from '@curioushuman/common';

import { GroupSource } from '../../domain/entities/group-source';
import { GroupSourceStatus } from '../../domain/value-objects/group-source-status';

/**
 * A builder for Group Sources to play with in testing.
 */

/**
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of Group
 * For the purpose of being able to create invalid Groups & DTOs and such
 */
type GroupSourceLooseMimic = {
  [K in keyof GroupSource]?: GroupSource[K] | string | number;
};

// timestamps used below
const timestamps: number[] = [];
const dateAgo = new Date();
for (let i = 0; i <= 3; i++) {
  dateAgo.setMonth(dateAgo.getMonth() - i);
  timestamps.push(dateAgo.getTime());
}

export const GroupSourceBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: GroupSourceLooseMimic = {
    id: '5008s1234519CjIAAU',
    status: 'open' as GroupSourceStatus,
    name: 'Learn to be a dancer',
    dateOpen: timestamps[2],
    dateClosed: timestamps[0],
  };
  const overrides: GroupSourceLooseMimic = {
    id: defaultProperties.id,
    status: defaultProperties.status,
    name: defaultProperties.name,
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
      overrides.name = 'Pending group';
      overrides.status = 'this is invalid';
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

    updated() {
      overrides.id = ExternalId.check('ThisSourceExists');
      overrides.name = 'Updated group';
      return this;
    },

    build(): GroupSource {
      return GroupSource.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): GroupSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupSource;
    },
  };
};
