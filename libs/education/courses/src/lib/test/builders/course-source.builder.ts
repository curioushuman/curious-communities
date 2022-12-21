import { ExternalId } from '@curioushuman/common';

import { CourseSource } from '../../domain/entities/course-source';
import { CourseSourceStatus } from '../../domain/value-objects/course-source-status';

/**
 * A builder for Course Sources to play with in testing.
 */

/**
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of Course
 * For the purpose of being able to create invalid Courses & DTOs and such
 */
type CourseSourceLooseMimic = {
  [K in keyof CourseSource]?: CourseSource[K] | string | number;
};

// timestamps used below
const timestamps: number[] = [];
const dateAgo = new Date();
for (let i = 0; i <= 3; i++) {
  dateAgo.setMonth(dateAgo.getMonth() - i);
  timestamps.push(dateAgo.getTime());
}

export const CourseSourceBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: CourseSourceLooseMimic = {
    id: '5008s1234519CjIAAU',
    status: 'open' as CourseSourceStatus,
    name: 'Learn to be a dancer',
    dateOpen: timestamps[2],
    dateClosed: timestamps[0],
  };
  const overrides: CourseSourceLooseMimic = {
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
      overrides.name = 'Pending course';
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

    build(): CourseSource {
      return CourseSource.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): CourseSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as CourseSource;
    },
  };
};
