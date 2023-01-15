import { Number, Record, Static, String } from 'runtypes';

export const SalesforceApiAuthResponse = Record({
  access_token: String,
  refresh_token: String,
  issued_at: Number,
});

export type SalesforceApiAuthResponse = Static<
  typeof SalesforceApiAuthResponse
>;
