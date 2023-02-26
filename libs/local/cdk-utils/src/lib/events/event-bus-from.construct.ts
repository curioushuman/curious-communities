import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import {
  resourceNameTitle,
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
  public role: iam.IRole;

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
     * Obtain the role that goes along with this event bus
     *
     * NOTE: for now we're using the allEventBus role
     *      but later we can create more specific roles
     *      and sub them in here
     *
     * TODO:
     * - [ ] create more specific roles
     * - [ ] build the role id from the id provided; OR change inputs
     */
    const allEventbusRoleId = 'cc-events-all';
    const [allEventbusRoleName, allEventbusRoleTitle] = resourceNameTitle(
      allEventbusRoleId,
      'Role'
    );
    this.role = iam.Role.fromRoleName(
      this,
      allEventbusRoleTitle,
      allEventbusRoleName
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
