import { RunTypeReplica } from '../../__types__';
import { SalesforceApiRepositoryErrorDataArray } from '.';

/**
 * All responses from SF come with this additional attribute
 */
interface SalesforceApiResponseBase {
  attributes: unknown;
}

/**
 * A type for a single response from SF
 */
export type SalesforceApiResponse<T> = T & SalesforceApiResponseBase;

/**
 * A type for a list of responses from SF
 */
export type SalesforceApiResponses<T> = {
  done: boolean;
  totalSize: number;
  records: SalesforceApiResponse<T>[];
  nextRecordsUrl?: string;
};

/**
 * Just the entity attributes
 */
export type SalesforceApiAttributes<T> = Omit<T, 'Id'>;

/**
 * This creates a runtype without the Id, for the purpose of record creation
 *
 * NOTE: Doing it this way allows us to validate before we make the call
 */
export const SalesforceApiAttributesRuntype = <T extends RunTypeReplica>(
  salesforceApiRunType: T
): SalesforceApiAttributes<T> => salesforceApiRunType.omit('Id');

/**
 * Response from SF when creating a record
 */
export interface SalesforceApiResponseFromCreate {
  id: string;
  success: boolean;
  errors: SalesforceApiRepositoryErrorDataArray;
}
