import { RunTypeReplica } from '../../__types__';

export type TribeApiResponses<T> = T[];

/**
 * Just the entity attributes
 */
export type TribeApiAttributes<T> = Omit<T, 'id'>;

/**
 * This creates a runtype without the Id, for the purpose of record creation
 *
 * NOTE: Doing it this way allows us to validate before we make the call
 */
export const TribeApiAttributesRuntype = <T extends RunTypeReplica>(
  salesforceApiRunType: T
): TribeApiAttributes<T> => salesforceApiRunType.omit('id');
