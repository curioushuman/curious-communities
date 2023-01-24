import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { TestEventBusConstruct } from '../src/test/events/eventbus';
import { TestDynamoDbTableConstruct } from '../src/test/dynamodb/table';

export class CcTestStack extends cdk.Stack {
  constructor(scope: Construct, stackId: string, props?: cdk.StackProps) {
    super(scope, stackId, props);

    /**
     * External events eventBus test
     */
    const testExternalEventsConstruct = new TestEventBusConstruct(
      this,
      'cc-events-external'
    );

    /**
     * Internal events eventBus test
     */
    const testInternalEventsConstruct = new TestEventBusConstruct(
      this,
      'cc-events-internal'
    );

    /**
     * Dynamodb table testing
     */
    const testDynamoDbConstruct = new TestDynamoDbTableConstruct(
      this,
      'cc-courses'
    );
  }
}
