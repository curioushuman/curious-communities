import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';

import {
  transformIdToResourceName,
  transformIdToResourceTitle,
} from '../utils/name';
import { ResourceId } from '../utils/name.types';

/**
 * LayerFrom construct
 *
 * This accepts a ResourceId, and
 */
export class ChEventBusFrom extends Construct {
  public id: ResourceId;
  public eventBus: events.IEventBus;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    /**
     * This will check the id and prefix are the correct format
     * OR throw an error
     */
    this.id = ResourceId.check(id);

    const eventBusTitle = transformIdToResourceTitle(this.id, 'EventBus');
    const eventBusArn = this.prepareArn(this.id);
    this.eventBus = events.EventBus.fromEventBusArn(
      this,
      eventBusTitle,
      eventBusArn
    );
  }

  private prepareArn(id: ResourceId) {
    const accountId =
      process.env.NODE_ENV === 'local'
        ? process.env.AWS_ACCOUNT_LOCAL
        : cdk.Aws.ACCOUNT_ID;
    const name = transformIdToResourceName(id, 'EventBus');
    return `arn:aws:events:${cdk.Aws.REGION}:${accountId}:event-bus:${name}`;
  }
}
