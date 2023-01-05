import { Static } from 'runtypes';

import { createInternalId, InternalId } from '@curioushuman/common';

export const CourseId = InternalId.withBrand('CourseId');

export type CourseId = Static<typeof CourseId>;

/**
 * This is here as a layer of abstraction to allow us to change the
 * implementation of the ID at a later date.
 */
export const createCourseId = (): InternalId => {
  return createInternalId();
};
