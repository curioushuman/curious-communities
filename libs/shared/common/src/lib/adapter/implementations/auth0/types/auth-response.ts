import { Record, Static, String } from 'runtypes';

export const Auth0ApiAuthResponse = Record({
  access_token: String,
  token_type: String,
});

export type Auth0ApiAuthResponse = Static<typeof Auth0ApiAuthResponse>;
