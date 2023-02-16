import { Record, Static } from 'runtypes';
import { NotEmptyString } from '@curioushuman/common';

/**
 * Type for external course entity
 *
 * NOTES
 * - this is a DTO to distinguish it from an actual Course entity
 *   i.e. it is an incomplete DTO that only includes the values we need
 * - we only include the value objects we need within the groups context
 *
 * TODO:
 * - [ ] should there be two versions of this?
 *       1. the looser DTO that is handed between services; strings, etc
 *       2. the stricter DTO that is used within the domain
 *       OR should it be the stricter version that is used everywhere?
 */
export const CourseDto = Record({
  id: NotEmptyString,
  status: NotEmptyString,
  name: NotEmptyString,

  // e.g. APF being the account that owns this group
  accountOwner: NotEmptyString,
});

/**
 * Type for internal group entity
 */
export type CourseDto = Static<typeof CourseDto>;
