import * as events from 'aws-cdk-lib/aws-events';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  generateCompositeResourceId,
  resourceNameTitle,
} from '../../../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

export class CcCommonEvents extends Construct {
  constructor(scope: Construct, constructId: string) {
    super(scope, constructId);

    /**
     * Event Bus to handle all external events
     */
    const externalEventBusId = generateCompositeResourceId(
      constructId,
      'external'
    );
    const [externalEventBusName, externalEventBusTitle] = resourceNameTitle(
      externalEventBusId,
      'EventBus'
    );
    const externalEventsEventBus = new events.EventBus(
      this,
      externalEventBusTitle,
      {
        eventBusName: externalEventBusName,
      }
    );

    /**
     * Event Bus to handle all internal events
     */
    const internalEventBusId = generateCompositeResourceId(
      constructId,
      'internal'
    );
    const [internalEventBusName, internalEventBusTitle] = resourceNameTitle(
      internalEventBusId,
      'EventBus'
    );
    const internalEventsEventBus = new events.EventBus(
      this,
      internalEventBusTitle,
      {
        eventBusName: internalEventBusName,
      }
    );

    /**
     * For now we're creating a single role for all event buses
     * This will be expanded upon in the future
     */
    const allEventbusRoleId = generateCompositeResourceId(constructId, 'all');
    const [allEventbusRoleName, allEventbusRoleTitle] = resourceNameTitle(
      allEventbusRoleId,
      'Role'
    );
    const allEventsRole = new iam.Role(this, allEventbusRoleTitle, {
      roleName: allEventbusRoleName,
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
    });
  }
}
