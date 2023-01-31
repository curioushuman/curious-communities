interface SalesforceApiRepositoryErrorDataObject {
  error?: string;
  errorCode?: string;
  error_description?: string;
  message?: string;
}

export type SalesforceApiRepositoryErrorDataArray =
  SalesforceApiRepositoryErrorDataObject[];

type SalesforceApiRepositoryErrorData =
  | SalesforceApiRepositoryErrorDataObject
  | SalesforceApiRepositoryErrorDataArray;

export interface SalesforceApiRepositoryErrorResponse {
  status: number;
  statusText: string;
  data: SalesforceApiRepositoryErrorData;
}

export interface SalesforceApiRepositoryError extends Error {
  response?: SalesforceApiRepositoryErrorResponse;
}

export type SalesforceApiRepositoryErrorOrArray =
  | SalesforceApiRepositoryError
  | SalesforceApiRepositoryErrorDataArray;
