import { RunTypeReplica } from '../../common/repository.types';

export type Auth0ApiResponses<T> = T[];

/**
 * Just the entity attributes
 */
export type Auth0ApiAttributes<T> = Omit<T, 'user_id'>;

/**
 * This creates a runtype without the Id, for the purpose of record creation
 *
 * NOTE: Doing it this way allows us to validate before we make the call
 */
export const Auth0ApiAttributesRuntype = <T extends RunTypeReplica>(
  salesforceApiRunType: T
): Auth0ApiAttributes<T> => salesforceApiRunType.omit('user_id');
