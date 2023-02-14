/**
 * S is the Source
 */
export interface SourceRepository<S> {
  /**
   * All repositories should indicate what source they are
   */
  readonly SOURCE: S;
}
