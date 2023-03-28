import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChEventBusFrom,
  getAccountAndRegion,
  resourceNameTitle,
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
  private constructId: string;
  public logGroup!: logs.ILogGroup;

  constructor(scope: Construct, constructId: string) {
    super(scope, constructId);

    // save some props
    this.constructId = constructId;

    /**
     * EventBus
     */
    const eventBusConstruct = new ChEventBusFrom(this, constructId);

    /**
     * Log group
     */
    this.prepareLogGroup();

    /**
     * Rule: Subscribe the SQS queue to everything coming out of the EventBus
     */
    const [account, region] = getAccountAndRegion();
    const [eventsRuleName, eventsRuleTitle] = testResourceNameTitle(
      constructId,
      'Rule'
    );
    const eventsRule = new events.Rule(this, eventsRuleTitle, {
      ruleName: eventsRuleName,
      eventBus: eventBusConstruct.eventBus,
      description: `Listen for all events from ${constructId} event bus.`,
      eventPattern: {
        region: [region],
      },
    });
    eventsRule.addTarget(new targets.CloudWatchLogGroup(this.logGroup));
  }

  private prepareLogGroup(): void {
    const [logGroupName, logGroupTitle] = resourceNameTitle(
      this.constructId,
      'LogGroup'
    );
    this.logGroup = new logs.LogGroup(this, logGroupTitle, {
      logGroupName: logGroupName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_MONTH,
    });
  }
}
