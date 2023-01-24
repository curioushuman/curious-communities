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
  constructor(scope: Construct, stackId: string, props?: cdk.StackProps) {
    super(scope, stackId, props);

    /**
     * External events eventBus
     */
    const externalEventsEventBusId = 'cc-events-external';
    const externalEventBusConstruct = new ChEventBusFrom(
      this,
      'cc-events-external'
    );

    /**
     * Internal events eventBus
     */
    const internalEventsEventBusId = 'cc-events-internal';
    const internalEventBusConstruct = new ChEventBusFrom(
      this,
      'cc-events-internal'
    );

    /**
     * SQS queue that we will subscribe to all external events
     * via the event bus. We use this to test that events have been fired
     * via the API.
     */
    const externalEventsQueueId = externalEventsEventBusId;
    const [externalEventsQueueName, externalEventsQueueTitle] =
      testResourceNameTitle(externalEventsQueueId, 'Queue');
    const externalEventsQueue = new sqs.Queue(this, externalEventsQueueTitle, {
      queueName: externalEventsQueueName,
      retentionPeriod: cdk.Duration.hours(1),
    });

    /**
     * Rule: Subscribe the SQS queue to everything coming out of the EventBus
     */
    const [externalEventsRuleName, externalEventsRuleTitle] =
      testResourceNameTitle(externalEventsQueueId, 'Rule');
    const externalEventsRule = new events.Rule(this, externalEventsRuleTitle, {
      ruleName: externalEventsRuleName,
      eventBus: externalEventBusConstruct.eventBus,
      description: 'Listen for all events from cc-events-external event bus.',
      eventPattern: {
        detailType: ['putEvent'],
      },
    });
    externalEventsRule.addTarget(new targets.SqsQueue(externalEventsQueue));

    /**
     * SQS queue that we will subscribe to all internal events
     * via the event bus. We use this to test that events have been fired
     * via the API.
     */
    const internalEventsQueueId = internalEventsEventBusId;
    const [internalEventsQueueName, internalEventsQueueTitle] =
      testResourceNameTitle(internalEventsQueueId, 'Queue');
    const internalEventsQueue = new sqs.Queue(this, internalEventsQueueTitle, {
      queueName: internalEventsQueueName,
      retentionPeriod: cdk.Duration.hours(1),
    });

    /**
     * Rule: Subscribe the SQS queue to everything coming out of the EventBus
     */
    const [internalEventsRuleName, internalEventsRuleTitle] =
      testResourceNameTitle(internalEventsQueueId, 'Rule');
    const internalEventsRule = new events.Rule(this, internalEventsRuleTitle, {
      ruleName: internalEventsRuleName,
      eventBus: internalEventBusConstruct.eventBus,
      description: 'Listen for all events from cc-events-internal event bus.',
      eventPattern: {
        detailType: ['putEvent'],
      },
    });
    internalEventsRule.addTarget(new targets.SqsQueue(internalEventsQueue));
  }
}
