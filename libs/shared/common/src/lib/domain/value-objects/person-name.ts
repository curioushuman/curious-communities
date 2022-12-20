import { Static, String } from 'runtypes';

export const PersonName = String.withBrand('Name');

export type PersonName = Static<typeof PersonName>;
