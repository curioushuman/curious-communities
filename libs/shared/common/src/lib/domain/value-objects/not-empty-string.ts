import { Static, String } from 'runtypes';

export const NotEmptyString = String.withConstraint(
  (str: string) => !!str || `Cannot be empty`
);

export type NotEmptyString = Static<typeof NotEmptyString>;
