import { Record, Static, String } from 'runtypes';

export const SalesforceApiAuthResponse = Record({
  access_token: String,
});

export type SalesforceApiAuthResponse = Static<
  typeof SalesforceApiAuthResponse
>;
