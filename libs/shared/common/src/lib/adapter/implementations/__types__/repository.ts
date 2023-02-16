/**
 * Dirty little type hack that emulates just those parts of Runtype.Record that we need
 *
 * TODO: see if you can replace the replica with a derivative of Runtype
 */
export interface RunTypeReplica {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  omit: (...keys: string[]) => any;
  fields: Record<string, unknown>;
  check: (value: unknown) => unknown;
}
