/**
 * All queries have the same base
 *
 * TODO:
 * - [ ] if we were being thorough we'd map the models from Bettermode
 */

import { BettermodeApiRepositoryError } from '.';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BettermodeApiQuery<Q = any> {
  query: Q;
}

/**
 * All responses from the bettermode API are wrapped { data: response }
 */
export interface BettermodeApiResponse<R> {
  data: R;
  errors: BettermodeApiRepositoryError[];
}
