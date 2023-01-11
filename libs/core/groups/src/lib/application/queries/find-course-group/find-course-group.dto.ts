import { parseExternalIdSourceValue } from '@curioushuman/common';

import { GroupId } from '../../../domain/value-objects/group-id';
import {
  CourseGroupIdentifier,
  CourseGroupIdentifiers,
} from '../../../domain/entities/course-group';
import { Source } from '../../../domain/value-objects/source';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { GroupSlug } from '../../../domain/value-objects/group-slug';
import { CourseId } from '../../../domain/value-objects/course-id';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindCourseGroupDtoTypes = {
  [I in CourseGroupIdentifier]: {
    identifier: I;
    value: CourseGroupIdentifiers[I];
  };
};

/**
 * A type for the DTO parser function
 */
type FindCourseGroupDtoParser<I extends CourseGroupIdentifier> = (
  dto: FindCourseGroupDtoTypes[I]
) => CourseGroupIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindCourseGroupDtoParsers = {
  [K in CourseGroupIdentifier]: FindCourseGroupDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindCourseGroupDtoParsers = {
  id: (dto) => GroupId.check(dto.value),
  courseId: (dto) => CourseId.check(dto.value),
  idSourceValue: (dto) =>
    parseExternalIdSourceValue(dto.value, GroupSourceId, Source),
  slug: (dto) => GroupSlug.check(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match groupIdentifiers as the parsers object is derived
 * from the original groupIdentifiers type.
 */
export const courseGroupIdentifiers = Object.keys(
  parsers
) as CourseGroupIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our Group entity.
 */
export type FindCourseGroupDto =
  FindCourseGroupDtoTypes[keyof FindCourseGroupDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends CourseGroupIdentifier>(
  dto: FindCourseGroupDtoTypes[I]
) => (parsers[dto.identifier] as FindCourseGroupDtoParser<I>)(dto);
