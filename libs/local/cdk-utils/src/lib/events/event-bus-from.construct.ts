import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';

import {
  transformIdToResourceName,
  transformIdToResourceTitle,
} from '../utils/name';
import { ResourceId } from '../utils/name.types';

/**
 * EventBusFrom construct
 *
 * This type of construct makes it simpler to use an existing
 * eventBus without having to think too hard about it's ID.
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

    /**
     * Outputs
     */
    new cdk.CfnOutput(this, `eventBusArn for ${eventBusTitle}`, {
      value: eventBusArn,
    });
  }

  private prepareArn(id: ResourceId) {
    const accountId =
      process.env.NODE_ENV === 'local'
        ? process.env.AWS_ACCOUNT_LOCAL
        : cdk.Aws.ACCOUNT_ID;
    const name = transformIdToResourceName(id, 'EventBus');
    return `arn:aws:events:${cdk.Aws.REGION}:${accountId}:event-bus/${name}`;
  }
}
