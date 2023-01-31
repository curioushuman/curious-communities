import { Record, Static, Unknown } from 'runtypes';

export const SalesforceApiResponse = Record({
  attributes: Unknown,
});

export type SalesforceApiResponse = Static<typeof SalesforceApiResponse>;

export type SalesforceApiResponses<T> = {
  totalSize: number;
  records: T[];
};
