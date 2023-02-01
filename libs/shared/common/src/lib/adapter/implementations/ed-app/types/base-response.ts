import { RunTypeReplica } from '../../common/repository.types';

export type EdAppApiResponses<T> = {
  totalSize: number;
  items: T[];
};

/**
 * Just the entity attributes
 */
export type EdAppApiAttributes<T> = Omit<T, 'id'>;

/**
 * This creates a runtype without the Id, for the purpose of record creation
 *
 * NOTE: Doing it this way allows us to validate before we make the call
 */
export const EdAppApiAttributesRuntype = <T extends RunTypeReplica>(
  salesforceApiRunType: T
): EdAppApiAttributes<T> => salesforceApiRunType.omit('id');
