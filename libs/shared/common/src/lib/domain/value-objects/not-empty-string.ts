import { Static, String } from 'runtypes';

export const NotEmptyString = String.withConstraint(
  (n: string) => n !== '' || `Cannot be empty`
);

export type NotEmptyString = Static<typeof NotEmptyString>;
