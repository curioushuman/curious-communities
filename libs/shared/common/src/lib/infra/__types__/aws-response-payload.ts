export type CoAwsResponseEvent = 'created' | 'updated' | 'deleted';
export type CoAwsResponseOutcome = 'success' | 'failure' | 'no-change';

/**
 * This is the standard payload we'll be handing between microservices
 */
export interface CoAwsResponsePayload<EntityName extends string, EntityDetail> {
  event: CoAwsResponseEvent;
  outcome: CoAwsResponseOutcome;
  entity: EntityName;
  detail: EntityDetail;
}
