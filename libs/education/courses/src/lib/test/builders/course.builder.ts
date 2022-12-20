import { createYearMonth, Timestamp } from '@curioushuman/common';

import { Course, createCourseSlug } from '../../domain/entities/course';
import { CourseSource } from '../../domain/entities/course-source';
import { CourseResponseDto } from '../../infra/dto/course.response.dto';
import { CreateCourseRequestDto } from '../../infra/dto/create-course.request.dto';
import { CreateCourseDto } from '../../application/commands/create-course/create-course.dto';
import { CourseSourceBuilder } from './course-source.builder';

/**
 * A builder for Courses to play with in testing.
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
 * This is basically a looser mimic of Course
 * For the purpose of being able to create invalid Courses & DTOs and such
 */
type CourseLooseMimic = {
  [K in keyof Course]?: Course[K] | string | number | object;
};

// timestamps used below
const timestamps: number[] = [];
const dateAgo = new Date();
for (let i = 0; i <= 3; i++) {
  dateAgo.setMonth(dateAgo.getMonth() - i);
  timestamps.push(dateAgo.getTime());
}

export const CourseBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: CourseLooseMimic = {
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
  const overrides: CourseLooseMimic = {
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
      const source = CourseSourceBuilder().funkyChars().buildNoCheck();
      overrides.name = source.name;
      overrides.slug = createCourseSlug(source);
      return this;
    },

    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = CourseSourceBuilder().alpha().buildNoCheck();
      overrides.id = source.id;
      overrides.name = source.name;
      overrides.slug = createCourseSlug(source);
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = CourseSourceBuilder().alpha().buildNoCheck();
      overrides.id = source.id;
      overrides.name = source.name;
      overrides.slug = createCourseSlug(source);
      return this;
    },

    invalidSource() {
      overrides.id = CourseSourceBuilder().invalidSource().buildNoCheck().id;
      return this;
    },

    invalidStatus() {
      overrides.id = CourseSourceBuilder().invalidStatus().buildNoCheck().id;
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
      overrides.id = CourseSourceBuilder().exists().build().id;
      return this;
    },

    doesntExist() {
      overrides.id = 'CourseDoesntExist';
      overrides.slug = 'course-doesnt-exist';
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

    fromSource(source: CourseSource) {
      overrides.id = source.id;
      overrides.name = source.name;
      overrides.slug = createCourseSlug(source);
      return this;
    },

    build(): Course {
      return Course.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): Course {
      return {
        ...defaultProperties,
        ...overrides,
      } as Course;
    },

    buildCreateCourseDto(): CreateCourseDto {
      return {
        id: this.build().id,
      } as CreateCourseDto;
    },

    buildCreateCourseRequestDto(): CreateCourseRequestDto {
      return {
        id: this.buildNoCheck().id,
      } as CreateCourseRequestDto;
    },

    buildCourseResponseDto(): CourseResponseDto {
      return {
        ...defaultProperties,
        ...overrides,
      } as CourseResponseDto;
    },
  };
};
