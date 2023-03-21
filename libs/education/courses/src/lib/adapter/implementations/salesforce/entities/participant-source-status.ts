import { Literal, Static, Union } from 'runtypes';

export const SalesforceApiParticipantSourceStatus = Union(
  Literal('Pending'),
  Literal('Registered'),
  Literal('Confirmed'),
  Literal('Cancelled'),
  Literal('Attended, full participation'),
  Literal('Attended, partial participation')
);

export type SalesforceApiParticipantSourceStatus = Static<
  typeof SalesforceApiParticipantSourceStatus
>;
