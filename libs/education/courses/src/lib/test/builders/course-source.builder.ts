import { ExternalId } from '@curioushuman/common';
import { FindCourseSourceDto } from '../../application/queries/find-course-source/find-course-source.dto';

import { CourseSource } from '../../domain/entities/course-source';
import { CourseSourceStatusEnum } from '../../domain/value-objects/course-source-status';
import config from '../../static/config';

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
  let source = config.defaults.primaryAccountSource;

  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: CourseSourceLooseMimic = {
    id: '5008s1234519CjIAAU',
    source,
    status: CourseSourceStatusEnum.PENDING,
    name: 'Learn to be a dancer',
    dateOpen: timestamps[2],
    dateClosed: timestamps[0],
  };
  const overrides: CourseSourceLooseMimic = {
    id: defaultProperties.id,
    source: defaultProperties.source,
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

    alternateSource() {
      // NOTE: this is not a valid source
      // we only have a single source for courses ATM
      source = 'COMMUNITY';
      return this;
    },

    noMatchingSource() {
      return this;
    },

    invalid() {
      overrides.id = '';
      return this;
    },

    invalidStatus() {
      overrides.name = 'Pending course';
      overrides.status = 'this is invalid';
      return this;
    },

    invalidSource() {
      overrides.id = '5008s1234519CHHHHH';
      overrides.name = '';
      return this;
    },

    exists() {
      overrides.id = ExternalId.check('ThisSourceExists');
      return this;
    },

    doesntExist() {
      overrides.id = ExternalId.check('NothingExistsForThisId');
      return this;
    },

    updated() {
      overrides.id = ExternalId.check('ThisUsedForUpdating');
      overrides.name = 'Updated course';
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

    buildFindByIdSourceValueCourseSourceDto(): FindCourseSourceDto {
      const build = this.buildNoCheck();
      return {
        identifier: 'idSource',
        value: {
          id: build.id,
          source,
        },
        source,
      } as FindCourseSourceDto;
    },
  };
};
