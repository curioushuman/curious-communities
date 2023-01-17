import {
  CourseSourceIdentifier,
  CourseSourceIdentifiers,
} from '../../../domain/entities/course-source';
import { Source } from '../../../domain/value-objects/source';
import { FindCourseSourceMapper } from './find-course-source.mapper';

/**
 * This type sets up our identifiers as discriminated unions.
 * The structure would be:
 * {
 *   identifier: 'id',
 *   value: '123-456-abc-def'
 * }
 */
type FindCourseSourceDtoTypes = {
  [I in CourseSourceIdentifier]: {
    identifier: I;
    value: CourseSourceIdentifiers[I];
    source: Source;
  };
};

/**
 * A type for the DTO parser function
 */
type FindCourseSourceDtoParser<I extends CourseSourceIdentifier> = (
  dto: FindCourseSourceDtoTypes[I]
) => CourseSourceIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindCourseSourceDtoParsers = {
  [K in CourseSourceIdentifier]: FindCourseSourceDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindCourseSourceDtoParsers = {
  // * NOTE: the idSource parser will validate the idSource AND extract id
  idSource: (dto) => FindCourseSourceMapper.fromIdSourceToId(dto.value),
};

/**
 * This is an array of identifier literals for use in the mapper
 * We know they match courseIdentifiers as the parsers object is derived
 * from the original courseIdentifiers type.
 */
export const courseIdentifiers = Object.keys(
  parsers
) as CourseSourceIdentifier[];

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our CourseSource entity.
 */
export type FindCourseSourceDto =
  FindCourseSourceDtoTypes[keyof FindCourseSourceDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends CourseSourceIdentifier>(
  dto: FindCourseSourceDtoTypes[I]
) => (parsers[dto.identifier] as FindCourseSourceDtoParser<I>)(dto);
