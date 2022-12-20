import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const CompetitionName = NotEmptyString.withBrand('CompetitionName');

export type CompetitionName = Static<typeof CompetitionName>;
