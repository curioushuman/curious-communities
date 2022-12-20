import { Record, Static, String } from 'runtypes';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the CreateCourseRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const CreateCourseRequestDto = Record({
  id: String,
});

export type CreateCourseRequestDto = Static<typeof CreateCourseRequestDto>;
