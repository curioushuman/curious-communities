import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChEventBusFrom,
  testResourceNameTitle,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

export class CcTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * External events eventBus
     */
    const externalEventsEventBusId = 'cc-external';
    const externalEventBusConstruct = new ChEventBusFrom(this, 'cc-external');

    /**
     * Internal events eventBus
     */
    const internalEventsEventBusId = 'cc-internal';
    const internalEventBusConstruct = new ChEventBusFrom(this, 'cc-internal');

    /**
     * SQS queue that we will subscribe to all external events
     * via the event bus. We use this to test that events have been fired
     * via the API.
     */
    const queueId = externalEventsEventBusId;
    const [queueName, queueTitle] = testResourceNameTitle(queueId, 'Queue');
    const queueExternalEvents = new sqs.Queue(this, queueTitle, {
      queueName,
      retentionPeriod: cdk.Duration.hours(1),
    });

    /**
     * Rule: Subscribe the SQS queue to everything coming out of the EventBus
     */
    const [ruleName, ruleTitle] = testResourceNameTitle('course', 'Rule');
    const testSqsRule = new events.Rule(this, ruleTitle, {
      ruleName,
      eventBus: externalEventBusConstruct.eventBus,
      description: 'Listen for all events from cc-external event bus.',
      eventPattern: {
        detailType: ['putEvent'],
      },
    });
    testSqsRule.addTarget(new targets.SqsQueue(queueExternalEvents));
  }
}
