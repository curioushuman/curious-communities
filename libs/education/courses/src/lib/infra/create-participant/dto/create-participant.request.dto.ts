import { Record, Static, String } from 'runtypes';

/**
 * This is the form of data we expect as input into our application
 *
 * NOTE: this has been updated to accept strings. As this is the external
 * facing DTO, this will be OK. We then need to validate as we proceed
 * further into application layers.
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
