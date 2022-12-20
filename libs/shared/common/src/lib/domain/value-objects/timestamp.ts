import { Static } from 'runtypes';

import { PositiveInteger } from './positive-integer';

export const Timestamp = PositiveInteger.withBrand('Timestamp');

export type Timestamp = Static<typeof Timestamp>;
