import { Static } from 'runtypes';
import { GroupSourceStatus } from './group-source-status';

/**
 * ? Should we define the list twice?
 */
export const GroupStatus = GroupSourceStatus.withBrand('GroupStatus');

export type GroupStatus = Static<typeof GroupStatus>;
