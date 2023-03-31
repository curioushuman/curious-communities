export type CoAwsResponseEvent = 'created' | 'updated' | 'deleted';
export type CoAwsResponseOutcome = 'success' | 'failure' | 'no-change';

export interface CoAwsResponsePayloadBase<EntityDetail> {
  event: CoAwsResponseEvent;
  outcome: CoAwsResponseOutcome;
  detail: EntityDetail;
}

/**
 * This is the standard payload we'll be handing between microservices
 */
export type CoAwsResponsePayload<
  EntityName extends string,
  EntityDetail
> = CoAwsResponsePayloadBase<EntityDetail> & {
  entity: EntityName;
};

/**
 * This is used at the other end, when response payload is received as a request
 *
 * A less strict version.
 */
export type CoAwsRequestPayload<EntityDetail> =
  CoAwsResponsePayloadBase<EntityDetail> & {
    entity: string;
  };

/**
 * This type we would use in AWS CDK context to help define rules for event subscriptions
 *
 * We won't be able to use this until we've packaged everything
 * OR solved the CDK using local libraries things
 */
export type CoAwsResponsePayloadRuleDetail<
  EntityName extends string,
  EntityDetail
> = Partial<CoAwsResponsePayload<EntityName, EntityDetail>>;
