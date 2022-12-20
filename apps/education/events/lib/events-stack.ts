import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import { resourceNameTitle } from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

export class UeEventsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Event Bus to handle all external events
     */
    const eventBusId = 'ue-external-events';
    const [eventBusName, eventBusTitle] = resourceNameTitle(
      eventBusId,
      'EventBus'
    );
    const externalEventsEventBus = new events.EventBus(this, eventBusTitle, {
      eventBusName,
    });
  }
}
