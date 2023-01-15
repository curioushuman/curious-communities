import { Optional, Record, Static, String } from 'runtypes';

export const SalesforceApiAuthResponse = Record({
  access_token: String,
  scope: String,
  instance_url: Optional(String),
  token_type: String,
});

export type SalesforceApiAuthResponse = Static<
  typeof SalesforceApiAuthResponse
>;
