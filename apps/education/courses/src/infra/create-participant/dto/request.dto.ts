import { Record, Static, String } from 'runtypes';

/**
 * NOTE: At this time we're going to keep it as simple as possible. We're
 * going to assume that this lambda is only (currently) going to be called
 * from the create participant step functions. Within which all of the below will
 * be provided.
 *
 * At some later date we can improve upon this and make it more flexible.
 * e.g. supporting partial records or idSourceValue. Then within the service
 * we can react accordingly.
 */
const ParticipantSourcePartial = Record({
  id: String,
  status: String,
});

const CoursePartial = Record({
  id: String,
});

const MemberPartial = Record({
  id: String,
  email: String,
  name: String,
  organisationName: String,
});

export const CreateParticipantRequestDto = Record({
  participantSource: ParticipantSourcePartial,
  course: CoursePartial,
  member: MemberPartial,
});

export type CreateParticipantRequestDto = Static<
  typeof CreateParticipantRequestDto
>;
