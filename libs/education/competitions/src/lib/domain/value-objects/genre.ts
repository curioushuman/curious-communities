import { Static, String } from 'runtypes';

export const Genre = String.withBrand('Genre');

export type Genre = Static<typeof Genre>;
