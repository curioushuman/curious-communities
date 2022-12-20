import { Number as RuntypesNumber, Static } from 'runtypes';

export const PositiveInteger = RuntypesNumber.withBrand(
  'PositiveInteger'
).withConstraint(
  (n) => (Number.isInteger(n) && n >= 0) || `${n} is not positive`
);

export type PositiveInteger = Static<typeof PositiveInteger>;
