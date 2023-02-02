import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChEventBusFrom,
  getAccountAndRegion,
  testResourceNameTitle,
} from '../../../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

/**
 * Components required for the api-admin stack courses:find-one resource
 *
 * NOTES
 * - no props at this time, just using the construct for abstraction purposes
 */
export class TestEventBusConstruct extends Construct {
  constructor(scope: Construct, eventBusId: string) {
    super(scope, eventBusId);

    /**
     * EventBus
     */
    const eventBusConstruct = new ChEventBusFrom(this, eventBusId);

    /**
     * SQS queue that we will subscribe to all events from this eventbus.
     * We use this to test that events have been fired via the API.
     */
    const [eventsQueueName, eventsQueueTitle] = testResourceNameTitle(
      eventBusId,
      'Queue'
    );
    const eventsQueue = new sqs.Queue(this, eventsQueueTitle, {
      queueName: eventsQueueName,
      retentionPeriod: cdk.Duration.hours(1),
    });

    /**
     * Rule: Subscribe the SQS queue to everything coming out of the EventBus
     */
    const [account, region] = getAccountAndRegion();
    const [eventsRuleName, eventsRuleTitle] = testResourceNameTitle(
      eventBusId,
      'Rule'
    );
    const eventsRule = new events.Rule(this, eventsRuleTitle, {
      ruleName: eventsRuleName,
      eventBus: eventBusConstruct.eventBus,
      description: `Listen for all events from ${eventBusId} event bus.`,
      eventPattern: {
        region: [region],
      },
    });
    eventsRule.addTarget(new targets.SqsQueue(eventsQueue));
  }
}
