import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  resourceNameTitle,
  testResourceNameTitle,
} from '../../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

export class ApiAdminTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * (SUT) External events eventBus
     */
    const externalEventsEventBusId = 'ue-external-events';
    const [externalEventsEventBusName, externalEventsEventBusTitle] =
      resourceNameTitle(externalEventsEventBusId, 'EventBus');
    const externalEventsEventBus = events.EventBus.fromEventBusArn(
      this,
      externalEventsEventBusTitle,
      `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:${externalEventsEventBusName}`
    );

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
      eventBus: externalEventsEventBus,
      description: 'Listen for all events from ue-external-events event bus.',
      eventPattern: {
        detailType: ['putEvent'],
      },
    });
    testSqsRule.addTarget(new targets.SqsQueue(queueExternalEvents));
  }
}
