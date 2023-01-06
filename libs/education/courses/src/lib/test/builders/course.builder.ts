import {
  createYearMonth,
  prepareExternalIdSourceValue,
  Timestamp,
} from '@curioushuman/common';

import { Course } from '../../domain/entities/course';
import { CourseSource } from '../../domain/entities/course-source';
import { CourseResponseDto } from '../../infra/dto/course.response.dto';
import { CreateCourseRequestDto } from '../../infra/create-course/dto/create-course.request.dto';
import { CreateCourseDto } from '../../application/commands/create-course/create-course.dto';
import { CourseSourceBuilder } from './course-source.builder';
import config from '../../static/config';
import { createCourseSlug } from '../../domain/value-objects/course-slug';
import { CourseStatus } from '../../domain/value-objects/course-status';
import { UpdateCourseRequestDto } from '../../infra/update-course/dto/update-course.request.dto';
import { UpdateCourseDto } from '../../application/commands/update-course/update-course.dto';

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
    id: '8e925369-7dd5-4d92-b2a0-fba16384ce79',
    slug: 'learn_to_be_a_dancer',
    status: 'open' as CourseStatus,

    sourceIds: [
      {
        id: '5008s1234519CjBBHU',
        source: 'COURSE',
      },
    ],

    supportType: config.defaults.courseSupportType,
    name: 'Learn to be a dancer',
    dateOpen: timestamps[2],
    dateClosed: timestamps[0],
    yearMonthOpen: createYearMonth(timestamps[2] as Timestamp),

    accountOwner: config.defaults.accountOwner,
  };
  const overrides: CourseLooseMimic = {
    id: defaultProperties.id,
    slug: defaultProperties.slug,
    status: defaultProperties.status,

    sourceIds: defaultProperties.sourceIds,

    supportType: defaultProperties.supportType,
    name: defaultProperties.name,
    dateOpen: defaultProperties.dateOpen,
    dateClosed: defaultProperties.dateClosed,
    yearMonthOpen: defaultProperties.yearMonthOpen,

    accountOwner: defaultProperties.accountOwner,
  };

  return {
    setSource(source: CourseSource) {
      overrides.sourceIds = [
        {
          id: source.id,
          source: 'COURSE',
        },
      ];
    },

    funkyChars() {
      const source = CourseSourceBuilder().funkyChars().buildNoCheck();
      overrides.name = source.name;
      overrides.slug = createCourseSlug(source);
      return this;
    },

    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = CourseSourceBuilder().alpha().buildNoCheck();
      this.setSource(source);
      overrides.name = source.name;
      overrides.slug = createCourseSlug(source);
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = CourseSourceBuilder().beta().buildNoCheck();
      this.setSource(source);
      overrides.name = source.name;
      overrides.slug = createCourseSlug(source);
      return this;
    },

    invalidSource() {
      const source = CourseSourceBuilder().invalidSource().buildNoCheck();
      this.setSource(source);
      overrides.slug = createCourseSlug(source);
      return this;
    },

    invalidStatus() {
      const source = CourseSourceBuilder().invalidStatus().buildNoCheck();
      this.setSource(source);
      overrides.slug = createCourseSlug(source);
      return this;
    },

    noMatchingSource() {
      overrides.sourceIds = [
        {
          id: 'NothingCanBeFoundForThis',
          source: 'COURSE',
        },
      ];
      return this;
    },

    invalid() {
      delete defaultProperties.id;
      delete overrides.id;
      delete defaultProperties.sourceIds;
      delete overrides.sourceIds;
      delete defaultProperties.slug;
      delete overrides.slug;
      return this;
    },

    exists() {
      const source = CourseSourceBuilder().exists().build();
      this.setSource(source);
      overrides.name = source.name;
      overrides.slug = createCourseSlug(source);
      return this;
    },

    doesntExist() {
      overrides.id = '21406982-bdf9-4e6c-9095-cd890fb80081';
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
      this.setSource(source);
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
      const sourceId = this.build().sourceIds[0];
      return sourceId as CreateCourseDto;
    },

    buildCreateCourseRequestDto(): CreateCourseRequestDto {
      const sourceIds = this.buildNoCheck().sourceIds;
      if (!sourceIds) {
        return {
          idSourceValue: '',
        } as CreateCourseRequestDto;
      }
      return {
        idSourceValue: prepareExternalIdSourceValue(
          sourceIds[0].id,
          sourceIds[0].source
        ),
      } as CreateCourseRequestDto;
    },

    buildUpdateCourseDto(): UpdateCourseDto {
      const sourceId = this.build().sourceIds[0];
      return sourceId as UpdateCourseDto;
    },

    buildUpdateCourseRequestDto(): UpdateCourseRequestDto {
      const sourceIds = this.buildNoCheck().sourceIds;
      if (!sourceIds) {
        return {
          idSourceValue: '',
        } as CreateCourseRequestDto;
      }
      return {
        idSourceValue: prepareExternalIdSourceValue(
          sourceIds[0].id,
          sourceIds[0].source
        ),
      } as UpdateCourseRequestDto;
    },

    buildCourseResponseDto(): CourseResponseDto {
      return {
        ...defaultProperties,
        ...overrides,
      } as CourseResponseDto;
    },
  };
};
