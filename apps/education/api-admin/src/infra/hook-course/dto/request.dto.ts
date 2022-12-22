/**
 * This is the form the internal event should take
 *
 * NOTES
 * * We ONLY use this for testing and FYI.
 * - Currently APIGW doesn't support validation beyond exists/doesn't exist
 * - so we handle invalid external events by ignoring them
 * * for most up to date values check out hook.path.yaml
 */

export interface HookeInternalEventDto {
  object: string; // course, or entry
  type: string; // created, updated, status-updated
  id: string; // externalId
  status?: string; // only for status-updated
}