import { Static } from 'runtypes';

import { GroupSourceIdSource } from '../../../domain/value-objects/group-source-id-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateGroupDto = GroupSourceIdSource.withBrand('UpdateGroupDto');

export type UpdateGroupDto = Static<typeof UpdateGroupDto>;
