import { CourseId } from '../../../domain/value-objects/course-id';
import {
  CourseIdentifier,
  CourseIdentifiers,
} from '../../../domain/entities/course';
import { CourseSlug } from '../../../domain/value-objects/course-slug';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindCourseDtoTypes = {
  [I in CourseIdentifier]: {
    identifier: I;
    value: CourseIdentifiers[I];
  };
};

/**
 * A type for the DTO parser function
 */
type FindCourseDtoParser<I extends CourseIdentifier> = (
  dto: FindCourseDtoTypes[I]
) => CourseIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindCourseDtoParsers = {
  [K in CourseIdentifier]: FindCourseDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindCourseDtoParsers = {
  id: (dto) => CourseId.check(dto.value),
  slug: (dto) => CourseSlug.check(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match courseIdentifiers as the parsers object is derived
 * from the original courseIdentifiers type.
 */
export const courseIdentifiers = Object.keys(parsers) as CourseIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our Course entity.
 */
export type FindCourseDto = FindCourseDtoTypes[keyof FindCourseDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends CourseIdentifier>(
  dto: FindCourseDtoTypes[I]
) => (parsers[dto.identifier] as FindCourseDtoParser<I>)(dto);
