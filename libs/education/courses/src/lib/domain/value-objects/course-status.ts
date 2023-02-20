import { Static } from 'runtypes';
import { prepareEnumRuntype } from '@curioushuman/common';
import { CourseSourceStatusEnum } from './course-source-status';

/**
 * Internal influenced by external
 */
export const CourseStatusEnum = CourseSourceStatusEnum;

export const CourseStatus = prepareEnumRuntype(CourseStatusEnum);

export type CourseStatus = Static<typeof CourseStatus>;
